
import { useNavigate } from "react-router-dom";
import "../../public/styles/HomePage.css"
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ConfirmatioinModel from "../Components/confirmationModel";
import JoinChannelModal from "../Components/JoinChannelConfirmationModel";
import socket from "../../Utils/ConnectToSocket";
import { useRef } from "react";
export default function Home() {
    const [ShowGroupMembers, setShowGroupMembers] = useState(false)
    const [ShowCreateChannelBox, setShowCreateChannelBox] = useState(false)
    const [ShowJoinChannelBox, setShowJoinChannelBox] = useState(false)
    const [SelectedChannelJoin, setSelectedChannelJoin] = useState(null)
    const [IsUserMember, setIsUserMember] = useState(false)
    const [NewChannel, setNewChannel] = useState("")
    const [ChannelList, setChannelList] = useState([])
    const [YourUsername, setYourUsername] = useState('')
    const [ActiveChannel, setActiveChannel] = useState(null)
    const [PrevChannel, setPrevChannel] = useState('')
    const [Msg, setMsg] = useState("")
    const [MsgLst, setMsgLst] = useState([]);
    const [AllChannelMembers, setAllChannelMembers] = useState([])
    const [ActiveMembers, setActiveMembers] = useState([])
    const [OnlineUserCount, setOnlineUserCount] = useState(0)
    const [pageNo, setPageNo] = useState(1)
    const [NoOfPages, setNoOfPages] = useState(1)
    const [isTyping, setisTyping] = useState(null)
    const [shownav, setshownav] = useState(false)
    const bottomRef = useRef(null);

    function getISTTime() {
        const now = new Date();
        const options = {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        };
        return new Intl.DateTimeFormat("en-IN", options).format(now);
    }




    useEffect(() => {
        // const dummy = [
        //     { message: "Hello Abhay 👋", sender: "other", time: "10:21 AM" },
        //     { message: "Hi there!", sender: YourUsername, time: "10:22 AM" },
        //     { message: "What's up?", sender: "other", time: "10:23 AM" },
        // ];
        // setMsgLst(dummy);
        setNoOfPages((prev) => {
            return prev
        })

        console.log('roomName: MsgLst', MsgLst)
    }, [MsgLst]);



    // const apiUrl = "http://localhost:8080";
    const apiUrl = "https://assignmentdeerefbackend.onrender.com"
    let token = localStorage.getItem("token");

    const navigate = useNavigate();

    useEffect(() => {
        setMsgLst([])

        async function GetAllMessages() {
            try {
                let result = await axios.get(`${apiUrl}/GetAllMessages?ChannelName=${ActiveChannel}&page=${pageNo}`)
                console.log('GetAllMessages=', result)
                if (result?.data?.AllMessages) {
                    setMsgLst((prev) => {
                        return [...prev, ...result?.data?.AllMessages]
                    })
                }
                setNoOfPages(result?.data?.NoOfPage)
                console.log('result?.data?.AllMessages', result?.data?.AllMessages)
            } catch (err) {
                toast.error('Something went wrong')
            }


        }
        GetAllMessages()

    }, [ActiveChannel, pageNo])



    useEffect(() => {
        async function SendJoinRoom() {
            if (!ActiveChannel || YourUsername.trim() == '') return;
            console.log('This func was triggered')
            socket.emit("joinRoom", { ActiveChannel: ActiveChannel, User: YourUsername, PrevUserChannel: PrevChannel });

            // return () => {
            //     socket.emit("leaveRoom", ActiveChannel);
            // };
        }
        SendJoinRoom()

    }, [ActiveChannel, YourUsername]);

    useEffect(() => {

        async function GetAllChannelMember() {
            try {
                let result = await axios.get(`${apiUrl}/GetAllUsers/${ActiveChannel}`);
                if (result?.data?.msg) {
                    setAllChannelMembers([...result?.data?.msg])

                }

                //   console.log('Active Channel', result?.data?.msg);
            } catch (err) {
                toast.error('something went wrong');
            }
        }

        if (ActiveChannel) {
            GetAllChannelMember();
        }

    }, [ActiveChannel]);

    useEffect(() => {
        if (pageNo != NoOfPages) {
            setPageNo(NoOfPages)

        }
    }, [NoOfPages])
    useEffect(() => {
        console.log('IsUserMember', IsUserMember)
    }, [IsUserMember])
    useEffect(() => {
        socket.on('OnlineUsers', ({ lst, PrevChannelName }) => {
            console.log('lst', lst)
            console.log('PrevChannelName', PrevChannelName)
            setPrevChannel(PrevChannelName)
            setOnlineUserCount(lst.length)
            setActiveMembers([...lst])


        })

    }, [])
    useEffect(() => {
        socket.on("JoinDenied", ({ msg }) => {
            toast.error(msg) // or toast.error(msg)
        });
    }, [])



    useEffect(() => {
        const handleMessage = (msg) => {
            console.log("setMsgLst", msg);
            setMsgLst((prev) => {
                return [...prev, msg]
            })
        };

        socket.on("receiveMessage", handleMessage);

        return () => {
            socket.off("receiveMessage", handleMessage);
        };
    }, []);
    useEffect(() => {
        socket.on("SomeOneTyping", (val) => {
            console.log('Some One is typing', val)
            setTimeout(() => {
                setisTyping(val?.user)
            }, 100)
            setTimeout(() => {
                setisTyping(null)
            }, 500)
        })

    }, [])
    function SendMessage(msg) {
        if (msg.trim() === "") {
            toast.error("Message can't be empty");
            return;
        }
        if (pageNo != NoOfPages) {
            setPageNo(NoOfPages)

        }
        //  { message: "Hello Abhay 👋", sender: YourUsername, time: "10:21 AM" },
        const NewMsg = {
            roomName: ActiveChannel,
            message: msg,
            sender: YourUsername,
            time: getISTTime()


        }
        setMsgLst((prev) => {
            return [...prev, NewMsg]

        })
        socket.emit("sendMessage", NewMsg);
        setMsg("")
        //   return () => {
        //     socket.off("sendMessage", handleMessage);
        // };
    }

    async function GetAllChannel() {
        try {
            let result = await axios.get(`${apiUrl}/AllChannel`, {
                headers: {
                    Authorization: "Bearer " + token
                }
            })

            // console.log('GetAllChannel()=',result?.data?.AllChannels)
            if (result && result?.data) {
                setChannelList([...result?.data?.AllChannels])
                // setActiveChannel(result?.data?.AllChannels[0]?.name)
                console.log('result?.data?.AllChannels[0]', result?.data?.AllChannels[0]?.name)
            }

        } catch (err) {
            const message = err.response?.data?.err || "Some Error Occured!";
            toast.error(message)


        }


    }
    async function GetIsUserMember(channel) {
        if (!channel?._id) return;

        try {
            const result = await axios.get(
                `${apiUrl}/IsMember/${channel._id}`,
                {
                    // send id as query param
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );
            if (result.status == 200) {
                setIsUserMember(result?.data?.IsUserAlreadyMember)

            }



        } catch (err) {
            const message = err.response?.data?.err || "Some Error Occurred!";
            toast.error(message);
        }

        console.log('Checked membership for channel:', channel?._id);
    }

    async function HandleLeaveChannel(GetIsUserMember) {
        try {

            // /LeaveChannel
            if (!SelectedChannelJoin) return
            const result = await axios.put(
                `${apiUrl}/LeaveChannel/${SelectedChannelJoin._id}`,
                SelectedChannelJoin, // sending the whole channel object; usually you may just need minimal info
                {
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );
            if (result?.status == 200) {

                toast.success("Channel Leaved Success fully !")

                setSelectedChannelJoin(null);
                setShowJoinChannelBox(false);
                setIsUserMember(false)
            }

        } catch (err) {


        }


    }
    async function IsTyping(Val) {

        socket.emit('isTyping', Val)

    }
    async function HandleJoinRoom() {
        console.log('Join This Channel');

        // Check if a channel is selected
        if (!SelectedChannelJoin) return;

        try {
            const result = await axios.put(
                `${apiUrl}/channels/${SelectedChannelJoin._id}/join`,
                SelectedChannelJoin, // sending the whole channel object; usually you may just need minimal info
                {
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );

            console.log('Join successful:', result.data);
            if (result?.status == 200) {
                toast.success("U have Joined Channel Successfully")
                setIsUserMember(true)

            }

            // Clear the selected channel and close modal
            setSelectedChannelJoin({});
            setShowJoinChannelBox(false);

        } catch (err) {
            console.error('Error joining channel:', err);
            // optionally show a toast or alert
            const message = err.response?.data?.err || "Some Error Occured!";
            toast.error(message)
        }
    }

    async function HandleCreateChannel() {
        try {
            // /CreateChannel
            if (NewChannel.trim() == "") {
                toast.error("Channel Name Cant be empty")
                return
            }
            let Result = await axios.post(
                `${apiUrl}/CreateChannel`,
                { NewChannel },
                {
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );
            if (Result && Result?.status == 200) {
                setShowCreateChannelBox(false)
                setNewChannel("")

                GetAllChannel()

                toast.success("Channel Created Successfully")


            }
            console.log('HandleCreateChannel', Result?.status)


        } catch (err) {
            const message = err.response?.data?.err || "Some Error Occured!";
            toast.error(message)


        }

    }
    useEffect(() => {


        GetAllChannel()

    }, [])
    useEffect(() => {
        if (pageNo === NoOfPages) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [MsgLst]);

    useEffect(() => {
        async function GetUserDetails() {
            try {

                let result = await axios.get(
                    `${apiUrl}/UserDetails`,
                    {
                        headers: {
                            Authorization: "Bearer " + token
                        }
                    }
                );
                // console.log('result=', result?.data?.UserDetails?.name)
                setYourUsername(result?.data?.UserDetails?.name)

            } catch (err) {
                const message = err.response?.data?.err || "Session Expired !";
                navigate("/Login")
                toast.error(message);
            }


        }
        GetUserDetails()


    }, [])


    return <div className="HomePageContainer">
        <div className="ShowNav"><img onClick={() => { setshownav((prev) => { return !prev }) }} src={shownav ? "Images/closewhite.png" : "Images/Menunew.png"}></img></div>
        {/* <div className="ShowNav"><img onClick={() => { setshownav((prev) => { return !prev }) }} src="Images/closewhite.png"></img></div> */}
        <div className="HomePageInnerContainer">
            {ShowCreateChannelBox && <ConfirmatioinModel onClose={() => { setShowCreateChannelBox(false); setNewChannel("") }} NewChannel={NewChannel} setNewChannel={setNewChannel} onCreate={HandleCreateChannel}></ConfirmatioinModel>}
            <JoinChannelModal show={ShowJoinChannelBox} onConfirm={() => { IsUserMember ? HandleLeaveChannel() : HandleJoinRoom() }} onCancel={() => { setShowJoinChannelBox(false); }} isAlreadyMember={IsUserMember} channelName={SelectedChannelJoin}></JoinChannelModal>
            <div style={{ left: shownav && -2 }} className="HomePageLeftSide">
                <div className="HomePageLeftSideHeading">
                    <p>Welcome {YourUsername}</p>
                    <button onClick={() => {
                        localStorage.removeItem('UserId')
                        localStorage.removeItem('username')
                        localStorage.removeItem('token')
                        socket.disconnect();



                        navigate("/login")
                        toast.success('User Logged out..')
                    }} className="LogoutBtn">LogOut</button>
                    <button onClick={async () => {
                        socket.connect()
                        setActiveChannel((prev) => {
                            return prev
                        })
                        await GetIsUserMember(ActiveChannel)


                    }} className="LogoutBtn">Reconnect</button>
                </div>
                <div className="HomePageLeftSideCreateChannel"><h2 onClick={() => { setShowCreateChannelBox(true) }} style={{ fontWeight: '600', fontSize: '1rem' }}>+ Create New Channel</h2></div>
                <div className="HomePageLeftSideAllChannels">
                    {ChannelList?.map((ele) => {
                        return (
                            <span key={ele._id} className="ChannelName">
                                <span
                                    // ← FIX HERE
                                    onClick={() => {
                                        setShowJoinChannelBox(true);
                                        setSelectedChannelJoin(ele);
                                        GetIsUserMember(ele);
                                    }}
                                >
                                    {ele?.name}

                                </span>
                                <button onClick={() => {
                                    // setIsUserMember()
                                    GetIsUserMember(ele);
                                    setActiveChannel(ele.name)
                                    //  SendJoinRoom()


                                }} style={{
                                    width: '4rem',
                                    backgroundColor: ActiveChannel === ele.name ? "green" : "",
                                    color: 'black'
                                }}
                                >{ActiveChannel == ele.name ? 'Selected' : "Select"}</button></span>

                        );
                    })}





                </div>



            </div>
            <div className="HomePageRightSide">
                <div className="HomePageRightSideUpperSection">
                    <h2 className="HomePageRightSideUpperSectionHeading">#{ActiveChannel || 'Select Any One Room'}</h2>
                    <h3 className="HomePageRightSideUpperSubHeading">{OnlineUserCount} Members Online</h3>

                </div>
                {/* ShowGroupMembers */}
                <div className="HomePageRightSideBottomSection">
                    <img onClick={()=>{setShowGroupMembers((prev)=>{return !prev})}} className="PeopleGroup" style={{zIndex:'1000', width: '1.4rem', height: '1.4rem', top: '1.2rem', right: '1rem' }} src={ShowGroupMembers?"Images/closeblack.png":"Images/ChannelMember.png"}></img>
                    <div className="MessageBox">
                        <div className="IsTyping">
                            <p style={{ color: 'black', textAlign: 'center', fontSize: '0.8rem', paddingLeft: '0.5rem' }}>{isTyping && `${isTyping} is typing....`}</p>
                        </div>
                        <div className="MessageBoxScreen">
                            {MsgLst?.map((m, index) => (
                                <div key={index} className={`msgBubble ${m.sender == YourUsername ? 'you' : 'other'}`}>
                                    <span className="msgText">{m.message}</span>
                                    <span className="msgTime">{m.time}</span>
                                    <span className="msgTime">{m.sender == YourUsername ? 'You' : `${m.sender}`}</span>

                                </div>

                            ))}
                            <div ref={bottomRef}></div>


                        </div>
                        <div className="MessageBoxPaginationBox">
                            <button onClick={() => {
                                setPageNo((prev) => {
                                    if (prev == 1) {
                                        return 1
                                    } else {
                                        return prev = prev - 1
                                    }

                                })


                            }} className={`pagination-btn prev-btn ${pageNo == 1 && 'BtnNotActive'}`}>Prev</button>
                            <button
                                onClick={() => {

                                    setPageNo((prev) => {
                                        if (prev == NoOfPages) return NoOfPages

                                        return prev = prev + 1


                                    })
                                }}

                                className={`pagination-btn next-btn ${pageNo == NoOfPages && 'BtnNotActive'}`}>Next</button>
                        </div>

                        <div className="MessageBoxInput">
                            <input disabled={!IsUserMember} onChange={(e) => { IsTyping({ ActiveChannel: ActiveChannel, user: YourUsername }); setMsg(e.target.value) }} value={Msg} className="MessageInput"></input><button disabled={!IsUserMember} onClick={() => { SendMessage(Msg) }} className="MessageSendBtn">Send</button>
                        </div>

                    </div>
                    <div style={{ right: ShowGroupMembers ? "0%" : "-100%" }} className="OnlineUsersList">
                    <div className="OnlineUsersHeading">
                        <h5>Channel Members</h5>
                    </div>
                    <div className="OnlineUsersListInterior">
                        {AllChannelMembers.map((ele) => {
                            return <span className="OnlineUserListItem">
                                <span className={`status-dot ${ActiveMembers.includes(ele?.name) ? "online" : "offline"}`}></span>
                                <h4>{ele?.name}</h4>
                            </span>

                        })}

                        {/* <span className="OnlineUserListItem"><h4>User</h4></span> */}


                    </div>

                </div>



            </div>


        </div>

    </div>

    </div >
}