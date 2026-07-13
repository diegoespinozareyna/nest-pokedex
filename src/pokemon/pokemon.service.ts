import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(

    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>

  ) { }

  async create(createPokemonDto: CreatePokemonDto) {

    console.log(createPokemonDto);

    const pokemonNew = {
      ...createPokemonDto,
      name: createPokemonDto.name.toLocaleLowerCase()
    }

    try {
      const newPokemon = await this.pokemonModel.create(pokemonNew);
      return newPokemon;
    } catch (error: any) {
      this.handleException(error);
    }
  }

  findAll() {
    return this.pokemonModel.find().exec();
  }

  async findOne(id: string) {

    let pokemon: Pokemon | any;

    if (!isNaN(+id)) {
      pokemon = await this.pokemonModel.findOne({ no: +id }).exec();
    }

    if (isValidObjectId(id)) {
      pokemon = await this.pokemonModel.findById(id).exec();
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: id.toLocaleLowerCase().trim() }).exec();
    }

    if (!pokemon) {
      throw new NotFoundException(`Pokemon with name, id or no "${id}" not found`);
    }

    return pokemon;

  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(id);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }

    try {
      await pokemon.updateOne(updatePokemonDto, { new: true });
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error: any) {
      this.handleException(error);
    }

  }

  async remove(id: string) {

    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new NotFoundException(`Pokemon with id "${id}" not found`);
    }
    return { deletedCount };

  }

  private handleException(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon with "${JSON.stringify(error.keyValue)}" already exists in the database`);
    }
    throw new InternalServerErrorException(`Can't create the pokemon - check server logs`);
  }
}
