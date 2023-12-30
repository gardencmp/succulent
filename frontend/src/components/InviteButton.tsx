import { useState } from "react";

import {  Button } from "./ui/button";
import { CoValue } from "cojson";
import { Resolved, createInviteLink } from "jazz-react";
import { useToast } from "./ui/use-toast";

export function InviteButton<T extends CoValue>({ value }: { value?: Resolved<T> }) {
    const [existingInviteLink, setExistingInviteLink] = useState<string>();
    const { toast } = useToast();

    return (
        value?.meta.group?.myRole() === "admin" && (
            <Button
                size="sm"
                className="py-0"
                disabled={!value.meta.group || !value.id}
                variant="outline"
                onClick={async () => {
                    let inviteLink = existingInviteLink;
                    if (value.meta.group && value.id && !inviteLink) {
                        inviteLink = createInviteLink(value, "writer");
                        setExistingInviteLink(inviteLink);
                    }
                    if (inviteLink) {
                        navigator.clipboard.writeText(inviteLink).then(() =>
                            toast({
                                title: "Copied invite link to clipboard!",
                                description: inviteLink,
                            })
                        );
                    }
                }}
            >
                Invite
            </Button>
        )
    );
}
