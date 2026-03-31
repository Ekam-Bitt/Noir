import { City, State } from "country-state-city";

const INDIA_COUNTRY_CODE = "IN";

const allIndiaStates = State.getStatesOfCountry(INDIA_COUNTRY_CODE);

export const INDIA_STATES = allIndiaStates.map((state) => state.name);

export const INDIA_STATE_CITIES = Object.fromEntries(
  allIndiaStates.map((state) => [
    state.name,
    City.getCitiesOfState(INDIA_COUNTRY_CODE, state.isoCode)
      .map((city) => city.name)
      .filter((city, index, array) => array.indexOf(city) === index)
      .sort((left, right) => left.localeCompare(right)),
  ]),
) as Record<string, string[]>;
