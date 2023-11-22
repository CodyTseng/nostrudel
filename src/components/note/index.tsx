import React, { useRef } from "react";
import {
  Box,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  Flex,
  IconButton,
  Link,
  LinkBox,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { NostrEvent } from "../../types/nostr-event";
import UserAvatarLink from "../user-avatar-link";
import { Link as RouterLink } from "react-router-dom";

import NoteMenu from "./note-menu";
import { EventRelays } from "./note-relays";
import { UserLink } from "../user-link";
import { UserDnsIdentityIcon } from "../user-dns-identity-icon";
import NoteZapButton from "./note-zap-button";
import { ExpandProvider } from "../../providers/expanded";
import useSubject from "../../hooks/use-subject";
import appSettings from "../../services/settings/app-settings";
import EventVerificationIcon from "../event-verification-icon";
import { RepostButton } from "./components/repost-button";
import { QuoteRepostButton } from "./components/quote-repost-button";
import { ReplyIcon } from "../icons";
import NoteContentWithWarning from "./note-content-with-warning";
import { TrustProvider } from "../../providers/trust";
import { useRegisterIntersectionEntity } from "../../providers/intersection-observer";
import BookmarkButton from "./components/bookmark-button";
import useCurrentAccount from "../../hooks/use-current-account";
import NoteReactions from "./components/note-reactions";
import ReplyForm from "../../views/note/components/reply-form";
import { getReferences } from "../../helpers/nostr/events";
import Timestamp from "../timestamp";
import OpenInDrawerButton from "../open-in-drawer-button";
import { getSharableEventAddress } from "../../helpers/nip19";
import { useBreakpointValue } from "../../providers/breakpoint-provider";
import HoverLinkOverlay from "../hover-link-overlay";
import { nip19 } from "nostr-tools";
import NoteCommunityMetadata from "./note-community-metadata";
import useSingleEvent from "../../hooks/use-single-event";
import { InlineNoteContent } from "./inline-note-content";
import NoteProxyLink from "./components/note-proxy-link";

export type NoteProps = Omit<CardProps, "children"> & {
  event: NostrEvent;
  variant?: CardProps["variant"];
  showReplyButton?: boolean;
  showReplyLine?: boolean;
  hideDrawerButton?: boolean;
  registerIntersectionEntity?: boolean;
  clickable?: boolean;
};
export const Note = React.memo(
  ({
    event,
    variant = "outline",
    showReplyButton,
    showReplyLine = true,
    hideDrawerButton,
    registerIntersectionEntity = true,
    clickable = true,
    ...props
  }: NoteProps) => {
    const account = useCurrentAccount();
    const { showReactions, showSignatureVerification } = useSubject(appSettings);
    const replyForm = useDisclosure();

    // if there is a parent intersection observer, register this card
    const ref = useRef<HTMLDivElement | null>(null);
    useRegisterIntersectionEntity(ref, event.id);

    const refs = getReferences(event);
    const repliedTo = useSingleEvent(refs.replyId);

    const showReactionsOnNewLine = useBreakpointValue({ base: true, md: false });

    const reactionButtons = showReactions && <NoteReactions event={event} flexWrap="wrap" variant="ghost" size="xs" />;

    return (
      <TrustProvider event={event}>
        <ExpandProvider>
          <Card
            as={LinkBox}
            variant={variant}
            ref={registerIntersectionEntity ? ref : undefined}
            data-event-id={event.id}
            {...props}
          >
            {clickable && <HoverLinkOverlay as={RouterLink} to={`/n/${getSharableEventAddress(event)}`} />}
            <CardHeader p="2">
              <Flex flex="1" gap="2" alignItems="center">
                <UserAvatarLink pubkey={event.pubkey} size={["xs", "sm"]} />
                <UserLink pubkey={event.pubkey} isTruncated fontWeight="bold" fontSize="lg" />
                <UserDnsIdentityIcon pubkey={event.pubkey} onlyIcon />
                <Flex grow={1} />
                {showSignatureVerification && <EventVerificationIcon event={event} />}
                {!hideDrawerButton && (
                  <OpenInDrawerButton to={`/n/${getSharableEventAddress(event)}`} size="sm" variant="ghost" />
                )}
                <Link as={RouterLink} whiteSpace="nowrap" color="current" to={`/n/${getSharableEventAddress(event)}`}>
                  <Timestamp timestamp={event.created_at} />
                </Link>
              </Flex>
              <NoteCommunityMetadata event={event} />
              {showReplyLine && repliedTo && (
                <Flex gap="2" fontStyle="italic" alignItems="center" whiteSpace="nowrap">
                  <ReplyIcon />
                  <Text>
                    Replying to <UserLink pubkey={repliedTo.pubkey} fontWeight="bold" />
                  </Text>
                  <InlineNoteContent event={repliedTo} maxLength={96} isTruncated />
                </Flex>
              )}
            </CardHeader>
            <CardBody p="0">
              <NoteContentWithWarning event={event} />
            </CardBody>
            <CardFooter padding="2" display="flex" gap="2" flexDirection="column" alignItems="flex-start">
              {showReactionsOnNewLine && reactionButtons}
              <Flex gap="2" w="full" alignItems="center">
                <ButtonGroup size="xs" variant="ghost" isDisabled={account?.readonly ?? true}>
                  {showReplyButton && (
                    <IconButton icon={<ReplyIcon />} aria-label="Reply" title="Reply" onClick={replyForm.onOpen} />
                  )}
                  <RepostButton event={event} />
                  <QuoteRepostButton event={event} />
                  <NoteZapButton event={event} />
                </ButtonGroup>
                {!showReactionsOnNewLine && reactionButtons}
                <Box flexGrow={1} />
                <NoteProxyLink event={event} size="xs" variant="ghost" />
                <EventRelays event={event} />
                <BookmarkButton event={event} aria-label="Bookmark note" size="xs" variant="ghost" />
                <NoteMenu event={event} size="xs" variant="ghost" aria-label="More Options" />
              </Flex>
            </CardFooter>
          </Card>
        </ExpandProvider>
        {replyForm.isOpen && (
          <ReplyForm item={{ event, replies: [], refs }} onCancel={replyForm.onClose} onSubmitted={replyForm.onClose} />
        )}
      </TrustProvider>
    );
  },
);

export default Note;
