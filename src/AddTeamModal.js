import React, { useState, useRef } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";

function AddTeamModal({ user, openTM, setOpenTM, setTeamName }) {
  const handleClose = () => {
    setOpenTM(false);
    setNameError(false);
    setNewModal(true);
  };
  const name = useRef(null);
  const [nameError, setNameError] = useState(false);
  const [newModal, setNewModal] = useState(true);

  const validateName = () => {
    setNameError(false);
    setNewModal(false);
    if (name.current.value.length === 0) {
      setNameError(true);
      setNewModal(true);
    }
  };

  const addTeam = () => {
    setTeamName(name.current.value);
    user.set("teamName", name.current.value);
    user.save();
    handleClose();
  };

  return (
    <div>
      <Modal open={openTM} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 490,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            style={{ marginBottom: "5px" }}
          >
            What's your team name?{" "}
          </Typography>
          <TextField
            error={nameError}
            helperText={nameError ? "Please provide a name" : ""}
            label="Name"
            variant="outlined"
            margin="normal"
            fullWidth
            inputRef={name}
            onChange={validateName}
          />
          <Button
            variant="contained"
            color="info"
            style={{ margin: "10px" }}
            onClick={() => addTeam()}
            disabled={newModal || nameError}
          >
            Save
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default AddTeamModal;
