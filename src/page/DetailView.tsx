// References
//Chatgpt:https://chatgpt.com/share/6ac59f83-298c-83e9-945e-2f3300e5477b
//React website：https://v5.reactrouter.com/web/guides/quick-start
//Typescript cheatsheet：https://react-typescript-cheatsheet.netlify.app/
//HTML：https://developer.mozilla.org/en-US/docs/Web/HTML
//
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./DetailView.css";

// Pokemon type
interface PkmType {
  type: {
    name: string;
  };
}

// Pokemon ability
interface PkmAbility {
  ability: {
    name: string;
  };
  is_hidden: boolean;
}

// Pokemon stat
interface PkmStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

// Pokemon detail data
interface PkmDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  species: {
    name: string;
  };
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: PkmType[];
  abilities: PkmAbility[];
  stats: PkmStat[];
}

// Evolution API data
interface EvoLink {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvoLink[];
}

interface EvoPkm {
  id: number;
  name: string;
  image: string;
}

// Build evolution stages
function getEvoStages(chain: EvoLink, depth: number, stages: EvoPkm[][]) {
  if (!stages[depth]) stages[depth] = [];
  const id = Number(chain.species.url.split("/").filter(Boolean).pop());
  stages[depth].push({
    id: id,
    name: chain.species.name,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
  });
  chain.evolves_to.forEach((next) => { getEvoStages(next, depth + 1, stages);});
}

function DetailView() {
  const { id } = useParams();
  const loc = useLocation();
  const nav = useNavigate();
  // Previous page
  const from = loc.state?.from || "/";
  const [pkm, setPkm] = useState<PkmDetail | null>(null);
  const [evoStages, setEvoStages] = useState<EvoPkm[][]>([]);

  // Get Pokemon detail and evolution
  useEffect(() => {
    const getPkm = async () => {
      setPkm(null);
      const pkmRes = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
      setPkm(pkmRes.data);
      const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
      const evoRes = await axios.get(speciesRes.data.evolution_chain.url);
      const stages: EvoPkm[][] = [];
      getEvoStages(evoRes.data.chain, 0, stages);
      setEvoStages(stages);
    };
    getPkm();
  }, [id]);

  if (!pkm) return <p>Loading...</p>;

  // Previous Pokemon
  const prevPkm = () => {
    if (pkm.id > 1) {
      nav(`/pokemon/${pkm.id - 1}`, { state: { from: from } });
    }
  };

  // Next Pokemon
  const nextPkm = () => {
    if (pkm.id < 1025) {
      nav(`/pokemon/${pkm.id + 1}`, { state: { from: from } });
    }
  };

  const statName: Record<string, string> = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Speed",
  };

  return (
    <div className="detail-view">
      {/* Pokemon header */}
      <div className="detail-hero">
        <button className="back-button" onClick={() => nav(from)}>
          <span className="back-arrow">‹</span>
          Back
        </button>

        <div className="pokemon-heading">
          <h1>{pkm.name}</h1>
          <p>#{pkm.id.toString().padStart(3, "0")}</p>
        </div>

        <div className="main-pokemon-image">
          <img src={pkm.sprites.other["official-artwork"].front_default} alt={pkm.name} />
        </div>

      </div>


      <div className="detail-content">
        {/* Basic information */}
        <div className="information-grid">
          <div className="information-card">
            <div className="card-title">
              <span className="card-icon basic-icon">◉</span>
              <h2>Basic Information</h2>
            </div>

            <div className="basic-information">
              <div>
                <strong>Species</strong>
                <p className="species-name">{pkm.species.name}</p>
              </div>

              <div>
                <strong>Height</strong>
                <p>{pkm.height / 10} m</p>
              </div>

              <div>
                <strong>Weight</strong>
                <p>{pkm.weight / 10} kg</p>
              </div>
            </div>
          </div>


          {/* Types */}
          <div className="information-card">
            <div className="card-title">
              <span className="card-icon type-icon">⚡</span>
              <h2>Types</h2>
            </div>

            <div className="type-list">
              {pkm.types.map((item) => (
                <span className={`detail-type type-${item.type.name}`} key={item.type.name}>
                  {item.type.name}
                </span>
              ))}
            </div>
          </div>


          {/* Abilities */}
          <div className="information-card">
            <div className="card-title">
              <span className="card-icon ability-icon">⚙</span>
              <h2>Abilities</h2>
            </div>

            <div className="ability-list">
              {pkm.abilities.map((item) => (
                <div
                  className={item.is_hidden ? "ability-item hidden-ability" : "ability-item"}
                  key={item.ability.name}
                >
                  {item.is_hidden && <span className="hidden-label">Hidden</span>}
                  <span className="ability-name">{item.ability.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>


        {/* Stats */}
        <div className="full-information-card stats-card">
          <div className="card-title">
            <span className="card-icon stats-icon">▥</span>
            <h2>Base Stats</h2>
          </div>

          <div className="stats">
            {pkm.stats.map((item) => (
              <div className="stat-row" key={item.stat.name}>
                <span className="stat-name">{statName[item.stat.name]}</span>
                <span className="stat-dots"></span>
                <span className="stat-value">{item.base_stat}</span>
                <progress
                  className={`stat-progress stat-${item.stat.name}`}
                  value={item.base_stat}
                  max="180"
                />
              </div>
            ))}
          </div>
        </div>


        {/* Evolution */}
        <div className="full-information-card evolution-card">
          <div className="card-title">
            <span className="card-icon evolution-icon">↻</span>
            <h2>Evolution</h2>
          </div>

          <div className="evolution-track">
            {evoStages.map((stage, index) => (
              <div className="evolution-step" key={index}>
                <div className="evolution-stage">
                  <div className="evolution-stage-pokemon">
                    {stage.map((item) => (
                      <Link
                        to={`/pokemon/${item.id}`}
                        state={{ from: from }}
                        className={item.id === pkm.id ? "evolution-pokemon current-evolution" : "evolution-pokemon"}
                        key={item.id}
                      >
                        <div className="evolution-image">
                          <img src={item.image} alt={item.name} />
                        </div>

                        <p>{item.name}</p>
                        <span>#{item.id.toString().padStart(3, "0")}</span>
                      </Link>
                    ))}

                  </div>
                </div>
                {index < evoStages.length - 1 && (
                  <span className="evolution-arrow"> › </span>
                )}
              </div>
            ))}
          </div>
        </div>


        {/* Previous and next Pokemon */}
        <div className="detail-navigation">
          <button onClick={prevPkm} disabled={pkm.id === 1}>
            ← Previous
          </button>
          <button onClick={nextPkm} disabled={pkm.id === 1025}>
            Next →
          </button>
        </div>

      </div>
    </div>
  );
}

export default DetailView;