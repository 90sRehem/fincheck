import { Injectable } from "@nestjs/common";
import { ColorRepository, ListColorsUseCase } from "../../domain";

@Injectable()
export class ListColorsService extends ListColorsUseCase {}
