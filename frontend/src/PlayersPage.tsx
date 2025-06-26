import { useEffect, useState } from "react";

type Player = {
  id: number;
  name: string;
  created_at: string;
};

export default function PlayersPage({
  players,
  setPlayers,
}: {
  players: any[];
  setPlayers: (players: any) => void;
}) {
  const [newPlayer, setNewPlayer] = useState("");

  useEffect(() => {
    fetchPlayers();
  }, []);

  async function fetchPlayers() {
    try {
      const response = await fetch("http://localhost:8080/api/players");
      if (!response.ok) throw new Error("Failed to fetch players");
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function deletePlayer(id: number) {
    try {
      const response = await fetch(`http://localhost:8080/api/players/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete player");
      setPlayers((prev: Player[]) =>
        prev.filter((player: Player) => player.id !== id)
      );
    } catch (error) {
      console.error(error);
    }
  }
  async function createPlayer() {
    try {
      const response = await fetch("http://localhost:8080/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newPlayer }),
      });
      if (!response.ok) throw new Error("Failed to create player");
      const data = await response.json();
      setPlayers((prev: Player[]) => [...prev, data]);
      setNewPlayer("");
      console.log("Player created successfully:", data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <h3>Список игроков</h3>
      <div>
        <ul>
          {players.map((player) => (
            <li key={player.id}>
              {player.name}
              <button onClick={() => deletePlayer(player.id)}>Удалить</button>
            </li>
          ))}
        </ul>
        <div>
          <h3>Создать нового игрока</h3>
          <input
            type="text"
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            placeholder="Введите имя игрока"
          />
          <button onClick={createPlayer}>Создать игрока</button>
        </div>
      </div>
    </>
  );
}
