import NfcManager, { NfcTech } from "react-native-nfc-manager";

export default async function readTag() {
  await NfcManager.requestTechnology(NfcTech.Ndef);
  const tag = await NfcManager.getTag();
  console.log("Tag Found:", tag);
  NfcManager.cancelTechnologyRequest();
}
