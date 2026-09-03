import { storage, db } from './firebase-config.js';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { collection, getDocs } from 'firebase/firestore';

const platformMatchers = {
    linux: /linux/i,
    mac: /mac|darwin|osx/i,
    windows: /windows|win/i
};

export async function getAvailableVersions() {
    const versionsRef = collection(db, 'engine-versions');
    const snapshot = await getDocs(versionsRef);

    return snapshot.docs.map(versionDoc => ({
        id: versionDoc.id,
        ...versionDoc.data()
    }));
}

export async function getDownloadsForVersion(version) {
    const storageRef = ref(storage, `engine/releases/${version}`);
    const result = await listAll(storageRef);
    const downloads = {};

    for (const item of result.items) {
        const platform = Object.entries(platformMatchers)
            .find(([, matcher]) => matcher.test(item.name))?.[0];

        if (platform) {
            downloads[platform] = await getDownloadURL(item);
        }
    }

    return downloads;
}

function sortVersions(versions) {
    return [...versions].sort((first, second) => {
        const firstDate = first.releaseDate?.toDate?.() ?? new Date(first.releaseDate ?? 0);
        const secondDate = second.releaseDate?.toDate?.() ?? new Date(second.releaseDate ?? 0);
        return secondDate - firstDate;
    });
}

function updateDownloadButton(platform, url) {
    const button = document.getElementById(`download-${platform}`);
    if (!button) return;

    if (url) {
        button.href = url;
        button.removeAttribute('aria-disabled');
        button.classList.remove('cursor-not-allowed', 'opacity-60');
        return;
    }

    button.removeAttribute('href');
    button.setAttribute('aria-disabled', 'true');
    button.classList.add('cursor-not-allowed', 'opacity-60');
}

export async function populateDownloadButtons() {
    const versionLabel = document.getElementById('current-version');
    const versions = sortVersions(await getAvailableVersions());
    const latest = versions[0];

    if (!latest) {
        throw new Error('No engine versions are available.');
    }

    const downloads = await getDownloadsForVersion(latest.id);
    ['linux', 'mac', 'windows'].forEach(platform => {
        updateDownloadButton(platform, downloads[platform]);
    });

    if (versionLabel) {
        versionLabel.textContent = latest.id;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await populateDownloadButtons();
    } catch (error) {
        console.error('Unable to load engine downloads:', error);
        const versionLabel = document.getElementById('current-version');
        if (versionLabel) {
            versionLabel.textContent = 'Downloads unavailable';
        }
    }
});