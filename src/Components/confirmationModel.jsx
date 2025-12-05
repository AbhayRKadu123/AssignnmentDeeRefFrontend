import "../../public/styles/confirmationModel.css";

export default function ConfirmatioinModel({ onClose,NewChannel,setNewChannel, onCreate }) {

    return (
        <>
            
            <div className="ModalOverlay" onClick={onClose}></div>

            <div className="ConfirmationModel">
                
                <div className="ModalHeader">
                    <h2>Create Channel</h2>
                    <button className="CloseBtn" onClick={onClose}>✖</button>
                </div>

                <div className="ModalBody">
                    <label style={{ color: "white" }}>Channel Name</label>
                    <input 
                        type="text"
                        id="channelName"
                        placeholder="Enter channel name..."
                        className="ChannelInput"
                        value={NewChannel}
                        onChange={(event)=>{
                            setNewChannel(event.target.value)

                        }}
                    />
                </div>

                <div className="ModalFooter">
                    <button 
                        className="CreateBtn"
                        onClick={() => {
                            
                            onCreate();
                        }}
                    >
                        Create Channel
                    </button>
                </div>

            </div>
        </>
    );
}
