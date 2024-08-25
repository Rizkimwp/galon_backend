import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SendOtpDto, VerifyOtpDto } from 'src/dto/otpDto';
import { OtpService } from 'src/services/otp/otp.service';

@ApiTags('otp')
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send OTP to the provided phone number' })
  @ApiBody({
    description: 'Phone number to which OTP will be sent',
    type: SendOtpDto,
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Phone number is required' })
  async sendOtp(@Body() body: SendOtpDto) {
    const { phoneNumber } = body;

    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    await this.otpService.sendOtp(phoneNumber);
    return { message: 'OTP sent successfully' };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify the OTP for the given phone number' })
  @ApiBody({
    description: 'Phone number and OTP code to verify',
    type: VerifyOtpDto,
  })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({
    status: 400,
    description: 'Phone number and OTP are required',
  })
  @ApiResponse({ status: 401, description: 'Invalid OTP' })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const { phoneNumber, code } = body;

    if (!phoneNumber || !code) {
      throw new Error('Phone number and OTP are required');
    }

    const isValid = await this.otpService.verifyOtp(phoneNumber, code);

    if (isValid) {
      return { message: 'OTP verified successfully' };
    } else {
      throw new Error('Invalid OTP');
    }
  }
}
