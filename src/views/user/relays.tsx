import { useCallback, useMemo } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  SkeletonText,
} from "@chakra-ui/react";
import settings from "../../services/settings";
import useSubject from "../../hooks/use-subject";
import userContacts from "../../services/user-contacts";

export const UserRelaysTab = ({ pubkey }: { pubkey: string }) => {
  const relays = useSubject(settings.relays);

  const sub = useMemo(
    () => userContacts.requestUserContacts(pubkey, relays),
    [pubkey]
  );

  const contacts = useSubject(sub);

  const addRelay = useCallback(
    (url: string) => {
      settings.relays.next([...relays, url]);
    },
    [relays]
  );

  if (!contacts) {
    return <SkeletonText />;
  }

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Url</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(contacts.relays).map(([relay, opts]) => (
            <Tr key={relay}>
              <Td>{relay}</Td>
              <Td>
                <Button
                  onClick={() => addRelay(relay)}
                  isDisabled={relays.includes(relay)}
                >
                  Add Relay
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};