import { useState, useEffect } from "react";

function Counter() {
  const [count, setCount] = useState(0);


   useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <section className="counter">
      <h2>Számláló</h2>
      <p>{count}</p>

      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Nullázás</button>
      <button onClick={() => setCount(count + 1)}>+</button>
    </section>
  );
}

export default Counter;