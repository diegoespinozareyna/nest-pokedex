import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse, ResultPoke } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios;

  async excecuteSeed() {

    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650')

    const res = data.results.map((poke: ResultPoke) => {

      const segment = poke.url.split('/');
      const no = +segment[segment.length - 2];

      return { name: poke.name, no };
    })

    return res;
  }

}
