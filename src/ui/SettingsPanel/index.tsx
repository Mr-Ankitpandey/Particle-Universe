import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { X } from "lucide-react";
import { useStore } from "zustand";
import { sceneStore, updateScene, type Quality } from "../../state/store";
import { Slider } from "../common/Slider";
import { controls, readPath, writePath, type Tab } from "./controls";
import type { SceneConfig } from "../../scene/schema";
export function SettingsPanel({
  open,
  onOpenChange,
  onPause,
  onStep,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPause: () => void;
  onStep: () => void;
}) {
  const config = useStore(sceneStore, (s) => s.config),
    preset = useStore(sceneStore, (s) => s.preset),
    quality = useStore(sceneStore, (s) => s.quality);
  const change = (path: string, value: unknown, group = false) =>
    updateScene((scene) => writePath(scene, path, value), group);
  const check = (label: string, path: string) => (
    <label className="check-setting">
      <input
        type="checkbox"
        checked={Boolean(readPath(config, path))}
        onChange={(e) => change(path, e.target.checked)}
      />
      {label}
    </label>
  );
  const select = (label: string, path: string, options: readonly string[]) => (
    <label className="select-setting">
      {label}
      <select
        aria-label={label}
        value={String(readPath(config, path))}
        onChange={(e) => change(path, e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <Dialog.Portal>
        <Dialog.Content className="settings-panel">
          <div className="panel-heading">
            <Dialog.Title>Shape your universe</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Close settings">
              <X size={18} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="panel-description">
            Changes happen live. Double-click a slider to restore its preset
            value.
          </Dialog.Description>
          <Tabs.Root defaultValue="Galaxy">
            <Tabs.List className="settings-tabs">
              {(Object.keys(controls) as Tab[]).map((tab) => (
                <Tabs.Trigger key={tab} value={tab}>
                  {tab}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            {(Object.keys(controls) as Tab[]).map((tab) => (
              <Tabs.Content key={tab} value={tab} className="settings-content">
                {tab === "Galaxy" &&
                  select("Galaxy type", "galaxy.type", [
                    "spiral",
                    "elliptical",
                    "ring",
                    "barred",
                    "none",
                  ])}
                {tab === "Physics" && (
                  <>
                    {select("Pointer mode", "physics.pointerMode", [
                      "attract",
                      "repel",
                      "swirl",
                      "off",
                    ])}
                    {check("Curl-noise flow", "physics.flowField.enabled")}
                  </>
                )}
                {tab === "Appearance" && (
                  <>
                    <div className="palette-picker">
                      {(["core", "inner", "outer", "accent"] as const).map(
                        (key) => (
                          <label key={key}>
                            {key}
                            <input
                              aria-label={key + " color"}
                              type="color"
                              value={config.appearance.palette[key]}
                              onChange={(e) =>
                                change(
                                  "appearance.palette." + key,
                                  e.target.value,
                                  true,
                                )
                              }
                            />
                          </label>
                        ),
                      )}
                    </div>
                    <div className="palette-picker">
                      {(["top", "bottom"] as const).map((key) => (
                        <label key={key}>
                          Background {key}
                          <input
                            aria-label={"Background " + key}
                            type="color"
                            value={config.appearance.background[key]}
                            onChange={(e) =>
                              change(
                                "appearance.background." + key,
                                e.target.value,
                                true,
                              )
                            }
                          />
                        </label>
                      ))}
                    </div>
                    {select("Color mode", "appearance.colorMode", [
                      "radial",
                      "velocity",
                      "palette",
                      "image",
                    ])}
                    {select("Trail style", "appearance.trailStyle", [
                      "fade",
                      "streak",
                    ])}
                    {check("Nebula", "appearance.nebula.enabled")}
                  </>
                )}
                {controls[tab].map((control) => (
                  <Slider
                    key={control.path}
                    {...control}
                    value={Number(readPath(config, control.path))}
                    onChange={(value) => change(control.path, value, true)}
                    onReset={() =>
                      change(control.path, readPath(preset, control.path))
                    }
                  />
                ))}
                {tab === "Simulation" && (
                  <>
                    <label className="select-setting">
                      Quality
                      <select
                        aria-label="Quality"
                        value={quality}
                        onChange={(e) =>
                          sceneStore
                            .getState()
                            .setQuality(e.target.value as Quality)
                        }
                      >
                        {["auto", "high", "medium", "low"].map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                    <div className="button-row">
                      <button onClick={onPause}>Pause / resume</button>
                      <button onClick={onStep}>Step frame</button>
                    </div>
                    <p>
                      Auto gently fades a uniform subset of stars when needed.
                      Lock High to retain every star and maximum detail.
                    </p>
                  </>
                )}
                {tab === "Audio" && (
                  <>
                    <p>
                      Reaction mappings are saved with this universe. Audio
                      input is added in the sound phase.
                    </p>
                    {select("Bass response", "audio.bassTo", [
                      "pulse",
                      "rotation",
                      "size",
                      "none",
                    ])}
                    {select("High-frequency response", "audio.highsTo", [
                      "sparkle",
                      "hue",
                      "none",
                    ])}
                  </>
                )}
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function withAudio(scene: SceneConfig) {
  scene.audio ??= { reactive: false, bassTo: "pulse", highsTo: "sparkle" };
  return scene;
}
