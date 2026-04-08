import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useEffect, useState } from "react";
import { createActor } from "../backend";
import type { MenuActor, MenuItem } from "../types/menu";

export function useMenu() {
  const { actor, isFetching } = useActor(createActor);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);

  const reloadMenu = useCallback(async () => {
    if (!actor) return;
    try {
      const items = await (actor as unknown as MenuActor).getMenuItems();
      setMenuItems(items);
      setMenuLoaded(true);
    } catch (_e) {
      setMenuLoaded(true);
    }
  }, [actor]);

  useEffect(() => {
    if (!actor || isFetching) return;
    const init = async () => {
      try {
        // initMenu is a no-op on the backend (kept for API compat)
        await (actor as unknown as MenuActor).initMenu();
      } catch (_e) {
        // already initialized or error — proceed to load
      }
      await reloadMenu();
    };
    init();
  }, [actor, isFetching, reloadMenu]);

  return { menuItems, menuLoaded, reloadMenu };
}
