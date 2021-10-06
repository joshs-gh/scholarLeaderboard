import "./App.css";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { useState, useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import AddIcon from "@mui/icons-material/Add";
import AddScholarModal from "./AddScholarModal";
import AddTeamModal from "./AddTeamModal";
import ScholarTable from "./ScholarTable";
import IosShareIcon from "@mui/icons-material/IosShare";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

const Moralis = require("moralis");

function App() {
  // const BASE_URL = "http://localhost:3000/";
  const BASE_URL = "http://scholar-leaderboard.vercel.app";
  const GAME_API = "https://game-api.axie.technology/";
  // const EXCHANGE_API = "https://exchange-rate.axieinfinity.com/";
  const { authenticate, isAuthenticated, user, logout, isAuthenticating } =
    useMoralis();
  const [teamName, setTeamName] = useState(null);
  const [scholarArray, setScholarArray] = useState([]);
  const [openAS, setOpenAS] = useState(false);
  const [openTM, setOpenTM] = useState(false);
  const [openSL, setOpenSL] = useState(false);
  const [copySL, setCopySL] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const slref = useRef(null);

  let uid = window.location.href.split("/").pop(); // eg. http://localhost:3000/JCmVv8nRMcHZqFgHQFmNXTo5
  const { data } = useMoralisQuery("User", (query) =>
    query.equalTo("objectId", uid)
  );
  const urlData = JSON.parse(JSON.stringify(data, null, 2))[0]; // wtf is this object?  can't figure out how to parse w/o this hack

  useEffect(() => {
    uid.length > 10 && setReadonly(true);
    let scholars = [];
    if (user) {
      setTeamName(user.get("teamName"));
      setReadonly(false);
      scholars = user.get("scholarArray");
      var acl = new Moralis.ACL();
      acl.setPublicReadAccess(true);
      user.setACL(acl);
      user.save();
    }
    if (readonly && urlData) {
      scholars = urlData.scholarArray;
      setTeamName(urlData.teamName);
    }
    scholars && setScholarArray([...scholars]);
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
    if (!scholars) return;
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
          s["elo"] = data[dataindex].items[1].elo;
          s["rank"] = data[dataindex].items[1].rank;
        });
      })
      .finally(() => {
        // This does NOT work w/o the spread operator.  Drove me fucking nuts.
        setScholarArray([
          ...scholars.sort((a, b) => (a.avgslp < b.avgslp ? 1 : -1)),
        ]);
      });
  };

  const delScholar = (nameArray) => {
    let newa = [...scholarArray];
    nameArray.forEach((n) => {
      for (let i = 0; i < newa.length; i++) {
        if (n === newa[i].name) newa.splice(i, 1);
      }
    });
    setScholarArray([...newa]);
    user.set("scholarArray", newa);
    user.save();
  };

  // const resetDB = () => {
  //   user.set("scholarArray", testscholars); // to reset for setToSortedString
  //   user.save();
  //   setScholarArray(testscholars);
  // };

  const handleCloseSL = () => {
    setOpenSL(false);
    setCopySL(false);
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

  if (!teamName && !readonly) {
    return (
      <div>
        <AddTeamModal
          openTM={true}
          user={user}
          setOpenTM={setOpenTM}
          setTeamName={setTeamName}
        />
      </div>
    );
  }

  return (
    <>
      <Box
        sx={{
          mx: "auto",
          p: 1,
          m: 1,
          borderRadius: 1,
          textAlign: "center",
        }}
      >
        <div style={{ width: "1000px", margin: "auto" }}>
          <ScholarTable
            scholarArray={scholarArray}
            teamName={teamName}
            delScholar={delScholar}
            readonly={readonly}
            setOpenTM={setOpenTM}
          />
        </div>
        <p />
        {!readonly && (
          <div>
            <Button
              variant="outlined"
              color="primary"
              aria-label="add"
              onClick={() => setOpenAS(true)}
              sx={{ mr: 2 }}
            >
              <AddIcon sx={{ mr: 1 }} />
              Add Scholar
            </Button>
            <Button
              variant="outlined"
              sx={{ mr: 2 }}
              onClick={() => setOpenSL(true)}
            >
              <IosShareIcon sx={{ mr: 1 }} />
              Share Leaderboard
            </Button>
            {/* <Button variant="outlined" onClick={resetDB}>
              Reset DB
            </Button> */}
            <Button
              variant="outlined"
              onClick={() => logout()}
              disabled={isAuthenticating}
              color="error"
            >
              Logout
            </Button>
          </div>
        )}
        {!readonly && (
          <div>
            <AddScholarModal
              openAS={openAS}
              setOpenAS={setOpenAS}
              user={user}
              scholarArray={scholarArray}
              setScholarArray={setScholarArray}
              refreshSLP={refreshSLP}
            />
            <Modal open={openSL} onClose={handleCloseSL}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 500,
                  bgcolor: "background.paper",
                  border: "2px solid #000",
                  boxShadow: 24,
                  p: 2,
                  textAlign: "center",
                }}
                ref={slref}
              >
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    value={BASE_URL + user.id}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => {
                      navigator.clipboard.writeText(BASE_URL + user.id);
                      setCopySL(true);
                    }}
                  >
                    <ContentCopyIcon />
                  </Button>
                </Stack>
              </Box>
            </Modal>
            <Snackbar
              open={copySL}
              autoHideDuration={3000}
              onClose={() => setCopySL(false)}
            >
              <Alert
                onClose={() => setCopySL(false)}
                severity="success"
                sx={{ width: "100%" }}
              >
                Copied!
              </Alert>
            </Snackbar>
            <AddTeamModal
              openTM={openTM}
              user={user}
              setOpenTM={setOpenTM}
              setTeamName={setTeamName}
              value={teamName}
            />
          </div>
        )}
      </Box>
    </>
  );
}

export default App;

// let testscholars = [
//   {
//     name: "Geraldine",
//     ronin: "ronin:82594247ad4d2f4a92067f2fbf1b5c8198893eb8",
//   },
//   {
//     name: "Godjell",
//     ronin: "ronin:6e64409eca843f94ae28a2780a4e6ce60f97d1cf",
//   },
//   {
//     name: "Test2",
//     ronin: "ronin:c91d96d21786eedca894f63a9f4509e2877bddeb",
//   },
//   {
//     name: "Bishop",
//     ronin: "ronin:7ac0d26639f2a8e90409a88781cde6c93ac6ef8b",
//   },
//   {
//     name: "Father",
//     ronin: "ronin:f2ed21c1d0be7635c96fccccad2eff5e9a4475e5",
//   },
//   {
//     name: "cheese",
//     ronin: "ronin:a5c24437a76d9bf75d413f2234d10e6f1eea531c",
//   },
//   {
//     name: "Blessed",
//     ronin: "ronin:e7bc0a0dde843460d113376d671b1f9ca0fdb585",
//   },
//   { name: "Zammy", ronin: "ronin:562c7a8a4c05f2ecd555254740428d74eaf736c3" },
// ];
