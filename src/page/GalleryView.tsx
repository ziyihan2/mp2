// References
//Chatgpt:https://chatgpt.com/share/6ac59f83-298c-83e9-945e-2f3300e5477b
//React website：https://v5.reactrouter.com/web/guides/quick-start
//Typescript cheatsheet：https://react-typescript-cheatsheet.netlify.app/
//HTML：https://developer.mozilla.org/en-US/docs/Web/HTML
//
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import pokegalleryLogo from "../assets/pokegallery_logo.png";
import "./GalleryView.css";

// Pokemon data from API
interface ApiPkm {
  name: string;
  url: string;
}

// Pokemon data used in gallery
interface Pkm {
  id: number;
  name: string;
  image: string;
}

// Pokemon types
const types = [
  "all", "normal", "fire", "water", "electric", "grass", "ice", "fighting",
  "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon",
];

function GalleryView() {
  const [pkm, setPkm] = useState<Pkm[]>([]);
  const loc = useLocation();
  const [params, setParams] = useSearchParams();
  const curType = params.get("type") || "all";

  // Get Pokemon data when type changes
  useEffect(() => {
    // Get all Pokemon
    if (curType === "all") {
      axios.get("https://pokeapi.co/api/v2/pokemon?limit=1025").then((res) => {
        const data = res.data.results.map((item: ApiPkm) => {
          const id = Number(item.url.split("/").filter(Boolean).pop());

          return {
            id: id,
            name: item.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          };
        });

        setPkm(data);
      });
    } else { // Get Pokemon by type
      axios.get(`https://pokeapi.co/api/v2/type/${curType}`).then((res) => {
        const data = res.data.pokemon
          .map((item: { pokemon: ApiPkm }) => {
            const id = Number(item.pokemon.url.split("/").filter(Boolean).pop());

            return {
              id: id,
              name: item.pokemon.name,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            };
          })
          .filter((item: Pkm) => item.id >= 1 && item.id <= 1025);
        setPkm(data);
      });
    }
  }, [curType]);

  // Change type and update URL
  const changeType = (type: string) => {
    if (type === "all") {
      setParams({}, { replace: true });
    } else {
      setParams({ type: type }, { replace: true });
    }
  };

  return (
    <div className="gallery-view">
      <div className="pokegallery-header">
        <img src={pokegalleryLogo} alt="PokeGallery" className="pokegallery-logo" />
      </div>

      <div className="gallery-content">
        <div className="gallery-controls">
          <div className="type-filter-area">
            <span className="type-label">Type:</span>

            <div className="type-filters">
              {types.map((type) => (
                <button
                  key={type}
                  className={curType === type ? `type-button type-${type} active-type` : `type-button type-${type}`}
                  onClick={() => changeType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="view-buttons">
            <Link to="/" className="view-button" title="List View">☰</Link>
            <Link to="/gallery" className="view-button active" title="Gallery View">⊞</Link>
          </div>
        </div>

        <div className="gallery-grid">
          {pkm.map((item) => (
            <Link
              to={`/pokemon/${item.id}`}
              state={{ from: loc.pathname + loc.search }}
              className="gallery-card"
              key={item.id}
            >
              <div className="gallery-image">
                <img src={item.image} alt={item.name} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GalleryView;