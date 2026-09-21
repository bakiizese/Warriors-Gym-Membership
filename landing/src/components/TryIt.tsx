import { config } from "../config";
import { doors, type DoorId } from "../content";
import { LiveStage } from "./LiveStage";
import { Pass } from "./Pass";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

const targets: Record<DoorId, { open: string; apk: string }> = {
  "admin-web": { open: config.adminWebUrl, apk: "" },
  "admin-mobile": { open: config.adminMobileUrl, apk: config.apkAdminUrl },
  "member-mobile": { open: config.memberMobileUrl, apk: config.apkMemberUrl },
};

export function TryIt() {
  return (
    <section id="try" className="try-band relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <SectionHead index="01" kicker="Try it" title="Pick a door.">
            Three ways in, one shared backend. Add a member in the admin panel, then look for them in the other apps: it is all the same data.
          </SectionHead>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {doors.map((door, i) => (
            <Reveal key={door.id} delay={i * 90} className="h-full">
              <Pass door={door} openUrl={targets[door.id].open} apkUrl={targets[door.id].apk} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <LiveStage />
        </Reveal>
      </div>
    </section>
  );
}
