import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sign } from 'jsonwebtoken';
import { TokenModel } from '../models/token.model';
import { UserModel } from '../models/user.model';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import * as bcrypt from 'bcryptjs';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
    @InjectModel(TokenModel.name) private tokenModel: Model<TokenModel>,
    private jwtService: JwtService,
    @Inject('NOTIFICATION_QUEUE') private notificationQueue: ClientProxy,
  ) {}

  async create(userDto: CreateUserDto, req: Request): Promise<void> {
    const { name, email, password } = userDto;

    const userExists = await this.userModel.findOne({ email }).exec();

    if (userExists) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const token = await this.generateAndSaveVerificationToken(
      newUser._id.toString(),
    );

    const verificationLink = `http://${req.headers.host}/api/user/verify/${newUser.email}/${token}`;
    const subject = 'Account Verification Link';

    this.notificationQueue.send('activationLink', {
      email: newUser.email,
      subject,
      verificationLink,
    });

    // TODO: Implement a sendActivationEmail Function
    // await sendEmail(newUser.email, subject, message);
  }

  async findUserById(userId: string): Promise<UserModel | null> {
    return this.userModel.findById(userId).exec();
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserModel | null> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      return null; // User not found
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null; // Invalid password
    }

    return user; // User is valid
  }

  async login(loginUserDto: LoginUserDto): Promise<{ token: string }> {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const token = await this.generateAccessToken(user);
    return { token };
  }

  async verifyUser(email: string, token: string): Promise<void> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const savedToken = await this.tokenModel
      .findOne({
        userId: user._id,
        token,
      })
      .exec();

    if (!savedToken) {
      throw new NotFoundException('Invalid token');
    }
    try {
      // Verify if the token has expired
      this.jwtService.verify(savedToken.token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
    user.isVerified = true;
    await user.save();

    // Delete the token from the database
    await savedToken.deleteOne();
  }

  async resendActivationLink(email: string, req: Request): Promise<void> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException(
        'This account has already been verified. Please log in.',
      );
    }

    await this.tokenModel.deleteMany({ userId: user._id }).exec();

    const token = await this.generateAndSaveVerificationToken(
      user._id.toString(),
    );

    const verificationLink = `http://${req.headers.host}/api/user/verify/${user.email}/${token}`;
    const subject = 'Account Verification Link';

    // Push the verification link to the notification queue for further processing
    // TODO: Check Queue Behaviour when it is down
    this.notificationQueue.send('activationLink', {
      email: user.email,
      subject,
      verificationLink,
    });
  }

  async generateAccessToken(user: UserModel): Promise<string> {
    const payload: Token = {
      email: user.email,
      _id: user._id.toString(),
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
  }

  async generateAndSaveVerificationToken(userId: string): Promise<string> {
    await this.tokenModel.deleteMany({ userId }).exec();

    const token = sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.ACTIVATION_TOKEN_EXPIRY,
    });

    const newToken = new this.tokenModel({ userId, token });
    await newToken.save();

    return token;
  }
}

interface Token {
  _id: string;
  email: string;
}
