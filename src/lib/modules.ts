import { getCollection } from 'astro:content';

/** CAP TRANSITION modules in the order of the learning path. */
export async function getModules() {
  return (await getCollection('modules')).sort((a, b) => a.data.order - b.data.order);
}
