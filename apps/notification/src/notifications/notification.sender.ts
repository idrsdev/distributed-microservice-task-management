// notification.sender.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

export type SendEmailNotificationI = {
  recipient: string;
  subject: string;
  content: string;
};
@Injectable()
export class NotificationSender {
  constructor(private readonly configService: ConfigService) {}

  sendEmailNotification({
    recipient,
    subject,
    content,
  }: SendEmailNotificationI): void {
    // Configure the SMTP transport settings for your email service provider
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUsername = this.configService.get<string>('SMTP_USERNAME');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');

    // Configure the SMTP transport settings
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });

    // Construct the email options
    const mailOptions = {
      from: 'notification@example.com',
      to: recipient,
      subject,
      text: content,
    };

    // Send the email notification
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  }
}
