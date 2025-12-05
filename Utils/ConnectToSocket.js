import { io } from "socket.io-client";
    const apiUrl="https://assignmentdeerefbackend.onrender.com"
    // const apiUrl="http://localhost:8080"

const socket = io(apiUrl);

export default socket;
