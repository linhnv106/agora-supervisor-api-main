import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';
import { AgoraConfig } from './config.type';

class EnvironmentVariablesValidator {
  @IsString()
  AGORA_APP_ID: string;

  @IsString()
  AGORA_CERTIFICATE: string;
}

export default registerAs<AgoraConfig>('agora', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    appID: process.env.AGORA_APP_ID,
    appCertificate: process.env.AGORA_CERTIFICATE,
  };
});
