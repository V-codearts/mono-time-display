interface AboutProps {
  currentPage: 'about' | 'other';
}

const About = ({ currentPage }: AboutProps) => {
  const pageContent: Record<string, React.ReactNode> = {
    about: (
      <div className="w-full flex flex-col items-center justify-center h-screen">
        <p className="text-foreground tracking-wider uppercase">PORTFOLIO</p>
        <p
          className="text-foreground tracking-wider uppercase"
          style={{ marginTop: 'calc(1em - 26px)' }}
        >
          PHOTOGRAPHY BY BENJAMIN LAARKO
        </p>
      </div>
    ),
    other: (
      <div className="w-full flex items-center justify-center h-screen">
        <p className="text-foreground tracking-wider uppercase">PORTFOLIO</p>
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
