export function BrandMark() {
  return (
    <span className="aegora-wordmark" aria-hidden="true">
      <img src="/aegora-logo.svg" alt="" />
      <style>{`
        .aegora-wordmark {
          display: inline-flex;
          align-items: center;
          width: clamp(142px, 13vw, 184px);
          line-height: 0;
        }

        .aegora-wordmark img {
          display: block;
          width: 100%;
          height: auto;
        }

        .brand > .aegora-wordmark + span {
          display: none;
        }
      `}</style>
    </span>
  );
}
