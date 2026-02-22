import { Module, Global } from '@nestjs/common';
import { EmailService } from './services/email.service';

@Global() // Makes it available everywhere
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class CommonModule {}