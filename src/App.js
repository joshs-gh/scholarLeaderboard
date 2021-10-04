import "@progress/kendo-theme-bootstrap/dist/all.css";
import "./App.css";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Input } from "@progress/kendo-react-inputs";
const Moralis = require("moralis");

function App() {
  const BASE_URL = "http://localhost:3000/";
  const SLPAPI = "https://game-api.axie.technology/slp/"; //  "https://axie-scho-tracker-server.herokuapp.com/api/account/";
  const EXCHANGE_API = "https://exchange-rate.axieinfinity.com/";
  const { authenticate, isAuthenticated, user, logout, isAuthenticating } =
    useMoralis();
  const [teamName, setTeamName] = useState("");
  const [scholarArray, setScholarArray] = useState([]);
  const [scholarCount, setScholarCount] = useState(0);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const name = useRef(null);
  const ronin = useRef(null);
  let uid = window.location.href.split("/").pop(); // eg. http://localhost:3000/JCmVv8nRMcHZqFgHQFmNXTo5
  const { data, error, isLoading } = useMoralisQuery("User", (query) =>
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

  async function fetchSLP(ronins) {
    if (!ronins) return;
    try {
      const response = await fetch(`${SLPAPI}${ronins}`);
      const slp = await response.json();
      return slp;
    } catch (error) {
      console.log("Fetch error: ", error);
    }
  }

  const refreshSLP = (scholars) => {
    let ronins = "";
    scholars.forEach((s) => {
      ronins = ronins + `${s.ronin},`;
    });
    fetchSLP(ronins)
      .then((data) => {
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
                (Date.now() / 1000 - data[dataindex].last_claimed_item_at) /
                  86400
              )
          );
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

  const toggleDialog = () => {
    setVisibleDialog(!visibleDialog);
  };

  const setTeam = () => {
    setTeamName("Merkle Scholars");
    user.set("teamName", "Merkle Scholars");
    user.save();
  };

  const addScholar = () => {
    let scholar = {
      name: name.current.state.value,
      ronin: ronin.current.state.value,
    };
    console.log("Adding Scholar: ", scholar);
    user.add("scholarArray", scholar);
    user.save();
    setScholarArray([...scholarArray, scholar]);
    toggleDialog();
    refreshSLP([...scholarArray, scholar]);
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
        <button onClick={() => authenticate()}>
          Authenticate with Metamask
        </button>
      </div>
    );
  }

  return (
    <div>
      {teamName && <h1>{teamName}</h1>}
      {scholarArray.map((s, id) => (
        <div key={id}>
          {id + 1} / {s.name} / {s.ronin} /{" "}
          {s.slp !== null ? s.slp : "Loading..."} /{" "}
          {s.avgslp !== null ? s.avgslp : "Loading..."}
          {!readonly ? (
            <button onClick={() => delScholar(id)}>Delete</button>
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
          <button onClick={() => setVisibleDialog(!visibleDialog)}>
            Add a Scholar
          </button>
          <button onClick={() => setTeam()}>Set Team Name</button>
          <button onClick={shareLeaderboard}>Share Leaderboard</button>
          <button onClick={resetDB}>Reset DB</button>
          <button onClick={() => logout()} disabled={isAuthenticating}>
            Logout
          </button>{" "}
        </div>
      )}
      {visibleDialog && (
        <Dialog title={"Add Scholar"} onClose={toggleDialog}>
          <p
            style={{
              margin: "25px",
              textAlign: "center",
            }}
          >
            Enter Scholar Info:{" "}
          </p>
          <Input placeholder="Name" ref={name} />
          <p />
          <Input placeholder="Ronin Wallet" ref={ronin} />
          <DialogActionsBar>
            <button className="k-button" onClick={() => addScholar()}>
              Save
            </button>
            <button className="k-button" onClick={toggleDialog}>
              Cancel
            </button>
          </DialogActionsBar>
        </Dialog>
      )}
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
