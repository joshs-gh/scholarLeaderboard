import "./App.css";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import AddScholarModal from "./AddScholarModal";

const Moralis = require("moralis");

function App() {
  const BASE_URL = "http://localhost:3000/";
  const GAME_API = "https://game-api.axie.technology/"; //  "https://axie-scho-tracker-server.herokuapp.com/api/account/";
  const EXCHANGE_API = "https://exchange-rate.axieinfinity.com/";
  const { authenticate, isAuthenticated, user, logout, isAuthenticating } =
    useMoralis();
  const [teamName, setTeamName] = useState("");
  const [scholarArray, setScholarArray] = useState([]);
  const [scholarCount, setScholarCount] = useState(0);
  const [openAS, setOpenAS] = useState(false);
  const [readonly, setReadonly] = useState(false);
  let uid = window.location.href.split("/").pop(); // eg. http://localhost:3000/JCmVv8nRMcHZqFgHQFmNXTo5
  const { data } = useMoralisQuery("User", (query) =>
    query.equalTo("objectId", uid)
  );
  const urlData = JSON.parse(JSON.stringify(data, null, 2))[0]; // wtf is this object?  can't figure out how to parse w/o this hack

  useEffect(() => {
    uid.length > 10 && setReadonly(true);
    let scholars = [];
    if (user) {
      setReadonly(false);
      scholars = user.get("scholarArray");
      var acl = new Moralis.ACL();
      acl.setPublicReadAccess(true);
      user.setACL(acl);
      user.save();
    }
    if (readonly && urlData) {
      scholars = urlData.scholarArray;
    }
    setScholarArray([...scholars]); // this creates a new array ref apparently
    refreshSLP(scholars);
  }, [data, user]);

  async function fetchData(ronins, slpmmr) {
    if (!ronins) return;
    try {
      const response = await fetch(`${GAME_API}${slpmmr}/${ronins}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.log("Fetch error: ", error);
    }
  }

  const refreshSLP = (scholars) => {
    let ronins = "";
    scholars.forEach((s) => {
      ronins = ronins + `${s.ronin},`;
    });
    fetchData(ronins, "slp").then((data) => {
      scholars.forEach((s) => {
        let dataindex;
        for (let i = 0; i < data.length - 1; i++) {
          if (s.ronin === data[i].client_id.replace("0x", "ronin:"))
            dataindex = i;
        }
        s["slp"] =
          data[dataindex].total - data[dataindex].blockchain_related.balance;
        s["avgslp"] = Math.floor(
          s["slp"] /
            Math.ceil(
              (Date.now() / 1000 - data[dataindex].last_claimed_item_at) / 86400
            )
        );
      });
    });
    fetchData(ronins, "mmr")
      .then((data) => {
        scholars.forEach((s) => {
          let dataindex;
          for (let i = 0; i < data.length - 1; i++) {
            if (s.ronin === data[i].items[1].client_id.replace("0x", "ronin:"))
              dataindex = i;
          }
          s["elo"] = data[dataindex].items[1].elo.toLocaleString();
          s["rank"] = data[dataindex].items[1].rank.toLocaleString();
        });
      })
      .finally(() => {
        // This does NOT work w/o the spread operator.  Drove me fucking nuts.
        setScholarArray([
          ...scholars.sort((a, b) => (a.avgslp < b.avgslp ? 1 : -1)),
        ]);
        setScholarCount(scholars.length);
      });
  };

  const setTeam = () => {
    setTeamName("Merkle Scholars");
    user.set("teamName", "Merkle Scholars");
    user.save();
  };

  const delScholar = (id) => {
    let newa = [...scholarArray];
    newa.splice(id, 1);
    setScholarArray([...newa]);
    setScholarCount(newa.length);
    user.set("scholarArray", newa);
    user.save();
  };

  const resetDB = () => {
    user.set("scholarArray", testscholars); // to reset for setToSortedString
    user.save();
    setScholarArray(testscholars);
  };

  const shareLeaderboard = () => {
    console.log(BASE_URL + user.id);
  };

  if (!isAuthenticated && !readonly) {
    return (
      <div>
        <Box
          sx={{
            mx: "auto",
            p: 1,
            m: 1,
            borderRadius: 1,
            textAlign: "center",
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1200px-MetaMask_Fox.svg.png"
            alt="Metamask"
            style={{ width: "250px", marginTop: "20vh" }}
          />
          <p />
          <Button variant="outlined" onClick={() => authenticate()}>
            Authenticate with Metamask
          </Button>
        </Box>
      </div>
    );
  }

  return (
    <div>
      <Box
        sx={{
          mx: "auto",
          p: 1,
          m: 1,
          borderRadius: 1,
          textAlign: "center",
        }}
      >
        {teamName && (
          <h1>
            Axie Scholars Leaderboard for: <p /> {teamName}
          </h1>
        )}
        {scholarArray.map((s, id) => (
          <div key={id}>
            {id + 1} / {s.name} / {s.ronin} /{" "}
            {s.slp !== null ? s.slp : "Loading..."} /{" "}
            {s.avgslp !== null ? s.avgslp : "Loading..."} /
            {s.elo !== null ? s.elo : "loading..."} /
            {s.rank !== null ? s.rank : "loading..."} /
            {!readonly ? (
              <Button variant="outlined" onClick={() => delScholar(id)}>
                Delete
              </Button>
            ) : (
              <span />
            )}
            <p />
          </div>
        ))}
        Scholar Count: {scholarCount}
        <p />
        {!readonly && (
          <div>
            <Fab
              variant="extended"
              size="medium"
              color="primary"
              aria-label="add"
              onClick={() => setOpenAS(true)}
            >
              <AddIcon sx={{ mr: 1 }} />
              Add Scholar
            </Fab>
            <Button variant="outlined" onClick={() => setTeam()}>
              Set Team Name
            </Button>
            <Button variant="outlined" onClick={shareLeaderboard}>
              Share Leaderboard
            </Button>
            <Button variant="outlined" onClick={resetDB}>
              Reset DB
            </Button>
            <Button
              variant="outlined"
              onClick={() => logout()}
              disabled={isAuthenticating}
              color="error"
            >
              Logout
            </Button>{" "}
          </div>
        )}
        <AddScholarModal
          openAS={openAS}
          setOpenAS={setOpenAS}
          user={user}
          scholarArray={scholarArray}
          setScholarArray={setScholarArray}
          refreshSLP={refreshSLP}
        />
      </Box>
    </div>
  );
}

export default App;

let testscholars = [
  {
    name: "Geraldine",
    ronin: "ronin:82594247ad4d2f4a92067f2fbf1b5c8198893eb8",
  },
  {
    name: "Godjell",
    ronin: "ronin:6e64409eca843f94ae28a2780a4e6ce60f97d1cf",
  },
  {
    name: "Test2",
    ronin: "ronin:c91d96d21786eedca894f63a9f4509e2877bddeb",
  },
  {
    name: "Bishop",
    ronin: "ronin:7ac0d26639f2a8e90409a88781cde6c93ac6ef8b",
  },
  {
    name: "Father",
    ronin: "ronin:f2ed21c1d0be7635c96fccccad2eff5e9a4475e5",
  },
  // {
  //   name: "cheese",
  //   ronin: "ronin:a5c24437a76d9bf75d413f2234d10e6f1eea531c",
  // },
  // {
  //   name: "Blessed",
  //   ronin: "ronin:e7bc0a0dde843460d113376d671b1f9ca0fdb585",
  // },
  // ronin:562c7a8a4c05f2ecd555254740428d74eaf736c3
];
