import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  create(_dto: CreateFolderDto) {
    // TODO: implement create folder
    return {};
  }

  findAll() {
    // TODO: implement list folders
    return [];
  }

  findOne(_id: string) {
    // TODO: implement get folder
    return {};
  }

  update(_id: string, _dto: UpdateFolderDto) {
    // TODO: implement update folder
    return {};
  }

  remove(_id: string) {
    // TODO: implement delete folder
    return {};
  }
}
