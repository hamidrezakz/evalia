import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly rounds = 12;
  hash(raw: string) {
    return bcrypt.hash(raw, this.rounds);
  }
  compare(raw: string, hash: string) {
    return bcrypt.compare(raw, hash);
  }
}
