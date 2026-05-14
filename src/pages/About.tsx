interface AboutProps {
  currentPage: 'about' | 'other';
  onNavigate?: (page: 'about' | 'other' | 'archive') => void;
}

const About = ({ currentPage, onNavigate }: AboutProps) => {
  const pageContent: Record<string, React.ReactNode> = {
    about: (
      <div className="w-full flex items-center justify-center h-screen">
        <p className="text-foreground tracking-wider uppercase">PORTFOLIO</p>
      </div>
    ),
    other: (
      <div className="w-full flex items-center justify-center h-screen">
        <div className="flex flex-col gap-0.5 items-center tracking-wider uppercase">
          <p className="text-muted-foreground hover:text-foreground cursor-pointer hover:font-bold transition-all w-fit">MEDIA</p>
          <p
            className="text-muted-foreground hover:text-foreground cursor-pointer hover:font-bold transition-all w-fit"
            onClick={() => onNavigate?.('archive')}
          >
            ARCHIVE
          </p>
          <p
            className="text-muted-foreground hover:text-foreground cursor-pointer hover:font-bold transition-all w-fit"
            onClick={() => onNavigate?.('about')}
          >
            ABOUT
          </p>
        </div>
      </div>
    ),
  };

  return (
    <div className="bg-background text-foreground font-mono min-h-screen">
      <div className="flex flex-col items-center justify-start min-h-screen">
        {pageContent[currentPage]}
      </div>
    </div>
  );
};

export default About;
