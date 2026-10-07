// References
//Chatgpt:https://chatgpt.com/share/6ac59f83-298c-83e9-945e-2f3300e5477b
//React website：https://v5.reactrouter.com/web/guides/quick-start
//Typescript cheatsheet：https://react-typescript-cheatsheet.netlify.app/
//HTML：https://developer.mozilla.org/en-US/docs/Web/HTML
//



// React hooks
// useState: store changed data
// useEffect: run code when page loads or data changes
// useRef: store data without rerender
import { useEffect, useRef, useState } from "react";
import axios from "axios";

// Link: direct to another page
// useLocation: get current URL information
// useSearchParams: get and change URL params
import { Link, useLocation, useSearchParams } from "react-router-dom";

import logo from "../assets/pokedex_title.png";
import "./ListView.css";


interface ApiPkm {
  name: string;
  url: string;
}

interface Pkm {
  id: number;
  name: string;
  image: string;
}

interface PkmType {
  type: {
    name: string;
  };
}

//20 results per page
const PER_PAGE = 20;


function ListView() {

  const [pkm, setPkm] = useState<Pkm[]>([]);
  const [pkmTypes, setPkmTypes] = useState<Record<number, string[]>>({});
  const typeCache = useRef<Record<number, string[]>>({});

  const loc = useLocation();
  const [params, setParams] = useSearchParams();

  const search = params.get("search") || "";
  const sort = params.get("sort") || "id-asc";
  const curPage = Number(params.get("page")) || 1;


  // get Pokemon data
  useEffect(() => {
    const getPkm = async () => {
      const res = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=1025");
      const data = res.data.results.map((item: ApiPkm) => {
        const id = Number(item.url.split("/").filter(Boolean).pop());
        return {
          id,
          name: item.name,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        };
      });
      setPkm(data);
    };
    getPkm();
  }, []);


  // search Pokemon
  const filtered = pkm.filter((item) => {
    const q = search.toLowerCase();
    if (q.startsWith("#")) return item.id.toString().startsWith(q.slice(1));
    return item.name.toLowerCase().includes(q);
  });


  // sort Pokemon
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "id-asc") return a.id - b.id;
    if (sort === "id-desc") return b.id - a.id;
    if (sort === "name-asc") return a.name.localeCompare(b.name);

    return b.name.localeCompare(a.name);
  });


  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const start = (curPage - 1) * PER_PAGE;
  const curPkm = sorted.slice(start, start + PER_PAGE);
  const curIds = curPkm.map((item) => item.id).join(",");


  // get types for current page
  useEffect(() => {
    const getTypes = async () => {
      const missing = curPkm.filter((item) => !typeCache.current[item.id]);

      if (missing.length === 0) return;

      const res = await Promise.all(
        missing.map((item) => axios.get(`https://pokeapi.co/api/v2/pokemon/${item.id}`))
      );

      const newTypes: Record<number, string[]> = {};

      res.forEach((r, i) => {
        const id = missing[i].id;
        const types = r.data.types.map((item: PkmType) => item.type.name);
        newTypes[id] = types;
        typeCache.current[id] = types;
      });

      setPkmTypes((prev) => ({
        ...prev,
        ...newTypes,
      }));
    };

    getTypes();
  }, [curIds]);


  // update URL
  const updateUrl = (newSearch: string, newSort: string, newPage: number) => {
    const p = new URLSearchParams();
    if (newSearch) p.set("search", newSearch);
    if (newSort !== "id-asc") p.set("sort", newSort);
    if (newPage !== 1) p.set("page", String(newPage));
    setParams(p, { replace: true });
  };


  const changePage = (page: number) => {
    updateUrl(search, sort, page);
  };


  // page number buttons
  const getPages = () => {
    const pages = [];
    const startPage = Math.max(1, Math.min(curPage - 2, totalPages - 4));
    const endPage = Math.min(totalPages, startPage + 4);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };


  return (
    <div className="list-view">
      <div className="pokedex-header">
        <img src={logo} alt="Pokedex" className="pokedex-logo" />
      </div>
      <div className="results-panel">
        <div className="controls">
          <div className="search-box">
            <span className="search-icon" aria-hidden="true"></span>
            <input
              type="text"
              placeholder="Search by name or #ID..."
              value={search}
              onChange={(e) => updateUrl(e.target.value, sort, 1)}
            />
          </div>

{/* sorting */}
          <div className="right-controls">
            <div className="sort-box">
              <label htmlFor="sort">Sort by</label>
              <select id="sort" value={sort} onChange={(e) => updateUrl(search, e.target.value, 1)}>
                <option value="id-asc"># (Lowest)</option>
                <option value="id-desc"># (Highest)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>

            <div className="view-buttons">
              <Link to="/" className="view-button active" title="List View">☰</Link>
              <Link to="/gallery" className="view-button window-icon" title="Gallery View">⊞</Link>
            </div>
          </div>
        </div>

{/* pokemon card */}
        <div className="pokemon-grid">
          {curPkm.map((item) => (
            <Link
              to={`/pokemon/${item.id}`}
              state={{ from: loc.pathname + loc.search }}
              className="pokemon-card"
              key={item.id}
            >
              <span className="pokemon-id">#{String(item.id).padStart(3, "0")}</span>
              <img src={item.image} alt={item.name} />
              <h2>{item.name}</h2>
              <div className="pokemon-types">
                {pkmTypes[item.id]?.map((type) => (
                  <span className={`type-badge type-${type}`} key={type}>
                    {type}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

{/* pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => changePage(curPage - 1)} disabled={curPage === 1}>
              ←
            </button>
            {getPages().map((page) => (
              <button
                key={page}
                className={page === curPage ? "page-button active-page" : "page-button"}
                onClick={() => changePage(page)}
              >
                {page}
              </button>
            ))}

            <button onClick={() => changePage(curPage + 1)} disabled={curPage === totalPages}>
              →
            </button>

          </div>
        )}

        {totalPages > 0 && (
          <p className="page-info">Page {curPage} of {totalPages}</p>
        )}
      </div>
    </div>
  );
}

export default ListView;