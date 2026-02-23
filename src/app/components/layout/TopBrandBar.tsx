import logoImg from '../../../assets/Stiker Logo - W.png';

export function TopBrandBar() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 flex justify-center"
      style={{ background: 'var(--brand-gradient)' }}
    >
      <div
        className="w-full flex items-center justify-center"
        style={{ maxWidth: 460, height: 72 }}
      >
        <img
          src={logoImg}
          alt="Imajin"
          style={{ height: 46, objectFit: 'contain' }}
        />
      </div>
    </div>
  );
}

