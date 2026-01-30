import {
  HCESession,
  NFCTagType4,
  NFCTagType4NDEFContentType,
} from "react-native-hce";

export default function sendNFCData( id ) {
  let session;

  const startSession = async () => {
    const tag = new NFCTagType4({
      type: NFCTagType4NDEFContentType.Text,
      content: String(id),
      writable: false,
    });

    session = await HCESession.getInstance();
    session.setApplication(tag);
    await session.setEnabled(true);
    console.log("enabled and allowed, sent");
  };

  startSession();
}
