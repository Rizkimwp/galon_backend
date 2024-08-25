import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'Phone number to which OTP will be sent',
    example: '+15017122661',
  })
  phoneNumber: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Phone number to verify OTP',
    example: '+15017122661',
  })
  phoneNumber: string;

  @ApiProperty({ description: 'OTP code to verify', example: '123456' })
  code: string;
}
