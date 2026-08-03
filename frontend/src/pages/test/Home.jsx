import {
  ChevronDown,
  Menu,
  Plus,
} from "lucide-react";

import "./Home.css";

export default function Home() {
  return (
    <div className="home">

      <div className="phone">

        <header>

          <div className="top">

            <button className="menuButton">
              <Menu size={22} />
            </button>

            <button className="brand">
              MiraLabs
              <ChevronDown size={18}/>
            </button>

          </div>

          <div className="tabs">

            <button className="active">
              Pour vous
            </button>

            <button>
              Vos notes
            </button>

            <button>
              Emploi du temps
            </button>

          </div>

        </header>

        <main>

          <div className="card">

            <span className="subtitle">
              📚 Basé sur votre journée
            </span>

            <h2>
              Prépare-moi
              <br />
              pour ce cours
            </h2>

            <div className="footer">

              <div>

                <div className="date">
                  Aujourd'hui
                </div>

                <div className="hour">
                  08:00
                </div>

              </div>

              <div>

                <strong>
                  Mathématiques
                </strong>

                <p>
                  Salle B204
                </p>

              </div>

              <ChevronDown size={18}/>

            </div>

          </div>

          <div className="card">

            <span className="subtitle">
              📝 Dernière note
            </span>

            <h2>
              Voir ma
              <br />
              nouvelle note
            </h2>

            <div className="footer">

              <img
                src="https://i.pravatar.cc/80"
                alt=""
              />

              <div>

                <strong>
                  Physique
                </strong>

                <p>
                  17 / 20
                </p>

              </div>

              <ChevronDown size={18}/>

            </div>

          </div>

        </main>

        <div className="prompt">

          <Plus size={20}/>

          <input
            placeholder="Rechercher..."
          />

        </div>

      </div>

    </div>
  );
}