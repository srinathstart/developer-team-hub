import { useState } from "react";
import apiFetch from "../api";

function useProjectMembers(onClearPageError) {
    const [selectedMembersProjectId, setSelectedMembersProjectId] = useState(null);
    const [members, setMembers] = useState([]);
    const [loadingMembersProjectId, setLoadingMembersProjectId] = useState(null);
    const [memberLoadError, setMemberLoadError] = useState(null);
    const [removingMemberId, setRemovingMemberId] = useState(null);
    const [memberRemoveError, setMemberRemoveError] = useState(null);
    const [updatingMemberId, setUpdatingMemberId] = useState(null);
    const [memberRoleError, setMemberRoleError] = useState(null);

    async function loadMembers(projectId, showGlobalError = true) {
        onClearPageError();

        const response = await apiFetch(
            `${import.meta.env.VITE_API_URL}/projects/${projectId}/members`
        );

        const data = await response.json();

        if (response.ok) {
            setSelectedMembersProjectId(projectId);
            setMembers(data);
            return "";
        }

        const message = data.error || "Failed to load members";

        if (showGlobalError) {
            onClearPageError(message);
        }

        return message;
    }

    async function handleViewMembers(projectId) {
        if (selectedMembersProjectId === projectId) {
            setSelectedMembersProjectId(null);
            setMembers([]);
            setMemberLoadError(null);
            return;
        }

        if (loadingMembersProjectId !== null) {
            return;
        }

        setMemberLoadError(null);
        setLoadingMembersProjectId(projectId);

        try {
            const message = await loadMembers(projectId, false);

            if (message) {
                setMemberLoadError({ projectId, message });
            }
        } finally {
            setLoadingMembersProjectId(null);
        }
    }

    async function handleAddMember(username, role) {
        onClearPageError();

        const response = await apiFetch(
            `${import.meta.env.VITE_API_URL}/projects/${selectedMembersProjectId}/members`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, role })
            }
        );

        const data = await response.json();

        if (response.ok) {
            await loadMembers(selectedMembersProjectId);
            return { success: true, error: "" };
        }

        return {
            success: false,
            error: data.error || "Failed to add member"
        };
    }

    async function handleRemoveMember(userId) {
        if (removingMemberId === userId) {
            return;
        }

        onClearPageError();
        setMemberRemoveError(null);
        setRemovingMemberId(userId);

        try {
            const response = await apiFetch(
                `${import.meta.env.VITE_API_URL}/projects/${selectedMembersProjectId}/members/${userId}`,
                { method: "DELETE" }
            );

            const data = await response.json();

            if (response.ok) {
                await loadMembers(selectedMembersProjectId);
            } else {
                setMemberRemoveError({
                    memberId: userId,
                    message: data.error || "Failed to remove member"
                });
            }
        } finally {
            setRemovingMemberId(null);
        }
    }

    async function handleUpdateMemberRole(userId, role) {
        if (updatingMemberId === userId) {
            return;
        }

        onClearPageError();
        setMemberRoleError(null);
        setUpdatingMemberId(userId);

        try {
            const response = await apiFetch(
                `${import.meta.env.VITE_API_URL}/projects/${selectedMembersProjectId}/members/${userId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ role })
                }
            );

            const data = await response.json();

            if (response.ok) {
                await loadMembers(selectedMembersProjectId);
            } else {
                setMemberRoleError({
                    memberId: userId,
                    message: data.error || "Failed to update member role"
                });
            }
        } finally {
            setUpdatingMemberId(null);
        }
    }

    return {
        selectedMembersProjectId,
        members,
        loadingMembersProjectId,
        memberLoadError,
        removingMemberId,
        memberRemoveError,
        updatingMemberId,
        memberRoleError,
        handleViewMembers,
        handleAddMember,
        handleRemoveMember,
        handleUpdateMemberRole
    };
}

export default useProjectMembers;
