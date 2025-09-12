import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AssignmentService } from '../services/assignment.service';
import {
  AddAssignmentDto,
  BulkAssignDto,
  UpdateAssignmentDto,
} from '../dto/session.dto';

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly service: AssignmentService) {}

  @Post()
  add(@Body() dto: AddAssignmentDto) {
    return this.service.add(dto);
  }

  @Post('bulk')
  bulk(@Body() dto: BulkAssignDto) {
    return this.service.bulkAssign(dto);
  }

  @Get('session/:sessionId')
  list(@Param('sessionId') sessionId: string) {
    return this.service.list(Number(sessionId));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAssignmentDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
