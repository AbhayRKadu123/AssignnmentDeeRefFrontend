import React from "react";
import "../../public/styles/JoinChannelConfirmationModel.css";

export default function JoinChannelModal({ show, onConfirm, onCancel, channelName, isAlreadyMember }) {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{isAlreadyMember ? "Leave Channel" : "Join Channel"}</h2>

                <p>
                    Are you sure you want to {isAlreadyMember ? "leave" : "join"} the channel{" "}
                    <strong>{channelName?.name || ""}</strong>?
                </p>

                <div className="modal-buttons">
                    <button className="confirm-btn" onClick={onConfirm}>Yes</button>
                    <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
