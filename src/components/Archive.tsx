import Gallery, { ItemData } from '@/components/Gallery';
import grills1 from '@/assets/archive-grills-1.png';
import grills2 from '@/assets/archive-grills-2.png';

const ARCHIVE_ITEMS: ItemData[] = [
  {
    id: 101,
    title: 'YE TEETH REPLICA',
    main: grills1,
    variations: [grills1, grills2],
    description: 'YE TEETH REPLICA\nSLS 3D PRINTED\n316L STAINLESS STEEL\nMADE TO EXPERIMENT WITH SLS\n1:1 CUSTOM FIT',
    compactMd: true,
    transitionVideos: {
      forwardLight: '/transitions/lighttrans1.mp4',
      forwardDark: '/transitions/darktrans1.mp4',
      backLight: '/transitions/lighttrans2.mp4',
      backDark: '/transitions/darktrans2.mp4',
    },
  },
];

interface ArchiveProps {
  onInspectChange?: (inspecting: boolean) => void;
  onBackHandlerReady?: (handler: (() => void) | null) => void;
  entering?: boolean;
  isExiting?: boolean;
  isDarkMode?: boolean;
  onLockTheme?: (locked: boolean) => void;
}

const Archive = (props: ArchiveProps) => <Gallery {...props} items={ARCHIVE_ITEMS} />;

export default Archive;
