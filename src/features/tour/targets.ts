import { atom } from 'jotai';
import { useCallback } from 'react';
import type { View } from 'react-native';

/**
 * Éléments que la visite guidée de l'accueil met en surbrillance, par
 * identifiant. Registre de module plutôt qu'un contexte React : l'onglet
 * « Infos » vit dans la barre de navigation, hors de l'écran d'accueil.
 */
const targets = new Map<string, View>();

export type TourRect = { x: number; y: number; width: number; height: number };

/** Ref à poser sur un élément pour qu'il puisse être mis en surbrillance. */
export function useTourTarget(id: string) {
  return useCallback(
    (node: View | null) => {
      if (node) targets.set(id, node);
      else targets.delete(id);
    },
    [id],
  );
}

/** Position de l'élément à l'écran, ou `null` s'il n'est pas affiché. */
export function measureTourTarget(id: string): Promise<TourRect | null> {
  const node = targets.get(id);
  if (!node) return Promise.resolve(null);
  return new Promise((resolve) => {
    node.measureInWindow((x, y, width, height) => {
      resolve(width > 0 && height > 0 ? { x, y, width, height } : null);
    });
  });
}

/**
 * Demande de relance de la visite (« Revoir la visite guidée » des
 * Réglages) : un compteur, l'accueil la relance à chaque incrément.
 */
export const homeTourReplayAtom = atom(0);
