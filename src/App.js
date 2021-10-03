import "@progress/kendo-theme-bootstrap/dist/all.css";
import "./App.css";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Input } from "@progress/kendo-react-inputs";
const Moralis = require("moralis");

function App() {
  const SLPAPI = "https://axie-scho-tracker-server.herokuapp.com/api/account/"; // "https://api.lunaciaproxy.cloud/_earnings/";
  const {
    authenticate,
    isAuthenticated,
    user,
    logout,
    isAuthenticating,
    setUserData,
  } = useMoralis();
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
  // console.log("URLDATA", urlData, error);

  useEffect(() => {
    uid.length > 10 && setReadonly(true);
    let scholars = [];
    // console.log("USER", user);
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
    // console.log("SCHOLARS:", scholars);
    setScholarArray([...scholars]); // this creates a new array ref apparently
    refreshSLP(scholars);
  }, [data, user]);

  async function fetchSLP(s) {
    try {
      const response = await fetch(`${SLPAPI}${s.ronin}`);
      const slp = await response.json();
      console.log(s.name, slp);
      return slp;
    } catch (error) {
      console.log("Fetch error: ", error);
    }
  }

  const refreshSLP = (scholars) => {
    scholars.forEach((s) => {
      fetchSLP(s)
        .then((data) => {
          console.log(s.name);
          s["slp"] = data.slpData.gameSlp; // data.earnings.slp_inventory;
          s["avgslp"] = Math.floor(
            s.slp / ((Date.now() / 1000 - data.slpData.lastClaim) / 86400) // data.earnings.last_claimed) / 86400)
          );
        })
        .finally(() => {
          setScholarArray([
            ...scholars.sort((a, b) => (a.avgslp < b.avgslp ? 1 : -1)),
          ]);
          setScholarCount(scholars.length);
        });
    });
  };

  const toggleDialog = () => {
    setVisibleDialog(!visibleDialog);
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

  const resetDB = () => {
    user.set("scholarArray", testscholars); // to reset for setToSortedString
    user.save();
    setScholarArray(testscholars);
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
      {scholarArray.map((s, id) => (
        <div key={id}>
          {id + 1} / {s.name} / {s.ronin} /{" "}
          {s.slp !== null ? s.slp : "Loading..."} /{" "}
          {s.avgslp !== null ? s.avgslp : "Loading..."}
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
          <button onClick={() => logout()} disabled={isAuthenticating}>
            Logout
          </button>
          <button onClick={resetDB}>Reset DB</button>
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
];

// const setData = () => {
//   user.set("scholarArray", [
//     {
//       name: "Bob",
//       ronin: "ronin:328492308493028439243902",
//     },
//   ]);
//   user.save();
//   console.log(user.get("scholarArray"));
// };

// const addData = () => {
//   user.addUnique("scholarArray", {
//     name: "Pam",
//     ronin: "ronin:7897987897878",
//   });
//   user.save();
//   console.log(user.get("scholarArray"));
// };

// const delData = () => {
//   user.remove("scholarArray", {
//     name: "Pam",
//     ronin: "ronin:7897987897878",
//   });
//   user.save();
//   console.log(user.get("scholarArray"));
// };
