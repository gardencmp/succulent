import { useState } from 'react';

import { Button } from './ui/button';
import { createInviteLink } from 'jazz-react';
import { useToast } from './ui/use-toast';
import { CoValue } from 'jazz-tools';

export function InviteButton<T extends CoValue>({
  value,
}: {
  value?: T | null;
}) {
  const [existingInviteLink, setExistingInviteLink] = useState<string>();
  const { toast } = useToast();

  return (
    value?._owner?.myRole() === 'admin' && (
      <Button
        size="sm"
        className="py-0"
        disabled={!value._owner || !value.id}
        variant="outline"
        onClick={async () => {
          let inviteLink = existingInviteLink;
          if (value._owner && value.id && !inviteLink) {
            inviteLink = createInviteLink(value, 'writer');
            setExistingInviteLink(inviteLink);
          }
          if (inviteLink) {
            navigator.clipboard.writeText(inviteLink).then(() =>
              toast({
                title: 'Copied invite link to clipboard!',
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
