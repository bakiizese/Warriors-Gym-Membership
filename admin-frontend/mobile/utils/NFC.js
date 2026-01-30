import NfcManager, { NfcTech, NfcEvents } from "react-native-nfc-manager";
import { TextDecoder } from "text-encoding";

export let decodedText = "";

async function NFC() {
  await NfcManager.start();

  return new Promise(async (resolve, reject) => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag) => {
      console.log("Tag discovered instantly:", tag);
      try {
        if (tag.ndefMessage && tag.ndefMessage.length > 0) {
          const record = tag.ndefMessage[0];

          // Convert payload safely to array
          const payload = Array.from(record.payload);

          const statusByte = payload[0];
          const langLength = statusByte & 0x3f;

          const textBytes = payload.slice(1 + langLength);
          const text = new TextDecoder("utf-8").decode(
            new Uint8Array(textBytes),
          );

          console.log("Decoded text:", text);
          decodedText = text;
          resolve(text);
        } else {
          resolve("");
        }
      } catch (err) {
        reject(err);
      } finally {
        // Stop scanning after first read
        await NfcManager.cancelTechnologyRequest();
      }
    });
    // Register tag event (start listening)
    await NfcManager.registerTagEvent({
      alertMessage: "Hold your phone near the sender",
      invalidateAfterFirstRead: true,
    });
    console.log("NFC listening for tags...");
  });
}

// Export function to start listening
export default NFC;

//export default NFC;
