import React, { useState } from "react";
import axios from "axios";
import { Box, TextField, Button } from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useAuth } from "@/hooks/AuthContext";
import LoadingImg from "@/assets/images/loading.svg";
import { convertApiUrl } from "@/utils/urls";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errMessage, setErrMessage] = React.useState("");
  const [errorOpen, setErrorOpen] = React.useState(false);

  const handleLogin = async () => {
    if (username === "") {
      setErrMessage(`Username is required`);
      setErrorOpen(true);
      return false;
    }

    if (password === "") {
      setErrMessage(`Password is required`);
      setErrorOpen(true);
      return false;
    }

    const loginData = {
      username: username,
      password: password,
    };

    setIsLoading(true);
    try {
      const response = await axios.post(convertApiUrl("signin"), loginData);
      setIsLoading(false);
      const user = response.data;
      login(user);
    } catch (error) {
      setIsLoading(false);
      // @ts-ignore
      if (error.response.data.message) {
        // @ts-ignore
        setErrMessage(error.response.data.message);
        setErrorOpen(true);
      } else {
        setErrMessage("Something went wrong");
        setErrorOpen(true);
      }
    }
  };

  const handleLoginKeyboard = async (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      await handleLogin();
    }
  }

  const handleErrorClose = () => {
    setErrorOpen(false);
    setErrMessage("");
  };

  return (
    <Box sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        label="Username"
        autoFocus
        autoComplete="off"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={(event) => handleLoginKeyboard(event)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type="password"
        id="password"
        autoComplete="off"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(event) => handleLoginKeyboard(event)}
      />
      <Button
        disabled={isLoading}
        onClick={handleLogin}
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, height: "40px"}}
      >
        {isLoading ? <img src={LoadingImg} /> : "Sign In"}
      </Button>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={errorOpen}
        onClose={handleErrorClose}
        message={errMessage}
      >
        <Alert
          onClose={handleErrorClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
