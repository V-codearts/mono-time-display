interface AboutProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onBack: () => void;
}

const About = ({ isDarkMode, onToggleTheme, onBack }: AboutProps) => {
  return (
    <div className="bg-background text-foreground font-mono min-h-screen flex items-center justify-center">
      {/* Back Button */}
      <div 
        className="fixed top-[18px] md:top-[24px] left-[18px] md:left-[24px] text-lg md:text-2xl font-normal cursor-pointer hover:scale-110 transition-transform duration-200 z-50"
        onClick={onBack}
      >
        &lt;
      </div>

      {/* Theme Toggle Dot */}
      <div 
        className="fixed top-[18px] md:top-[24px] right-[18px] md:right-[24px] w-3 h-3 bg-foreground rounded-full cursor-pointer hover:scale-110 transition-transform duration-200 z-50"
        onClick={onToggleTheme}
      />

      <div className="text-center">
        <h1 className="text-lg md:text-2xl font-normal tracking-wider">PORTFOLIO</h1>
        <p className="mt-4 text-sm md:text-base text-muted-foreground">You know the deal...</p>
      </div>
    </div>
  );
};

export default About;
