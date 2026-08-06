/**
 * Numărul de versiune, într-un singur loc.
 *
 * `self` merge și în pagină (unde e `window`), și în service worker (unde nu
 * există `window`), așa că același fișier hrănește și interfața, și numele
 * cache-ului offline. Când îl schimbi aici, browserul vede că un script
 * importat de `sw.js` s-a modificat și reinstalează service workerul, deci
 * versiunea nouă ajunge singură la toată lumea.
 *
 * Ce s-a schimbat la fiecare număr scrie în CHANGELOG.md.
 */
self.APP_VERSION = '0.3';
