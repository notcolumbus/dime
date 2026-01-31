import "./style.css";
import { createRoot } from "react-dom/client";
import { Header } from "./components/header";
import { Primary } from "./components/primary";
import { Alternative } from "./components/alternative";

function App() {
  return (
    <div className="w-[608px] min-h-fit bg-[#121212] pb-8">
      <Header
        cashbackRate="1.25%"
        cardLastFour="1234"
      />
      <div className="pt-28 pl-10 pr-10">
        <Primary
          card={{
            cardNumber: "1234567890123456",
            cardHolderName: "Joe Do",
            expiryDate: "02/30",
            cardType: "visa",
          }}
          cashbackPercentage={1.25}
          subtext="optimized card because of this this this this blah"
        />
        <Alternative
          cards={[
            {
              card: {
                cardNumber: "9876543210987654",
                cardHolderName: "Joe Do",
                expiryDate: "05/28",
                cardType: "mastercard",
              },
              cashbackPercentage: 3.0,
              subtext: "Best for dining and restaurants",
            },
            {
              card: {
                cardNumber: "5555666677778888",
                cardHolderName: "Joe Do",
                expiryDate: "11/27",
                cardType: "discover",
              },
              cashbackPercentage: 2.5,
              subtext: "Great for online shopping",
            },
            {
              card: {
                cardNumber: "3782822463100005",
                cardHolderName: "Joe Do",
                expiryDate: "08/29",
                cardType: "american_express",
              },
              cashbackPercentage: 2.0,
              subtext: "Travel and entertainment rewards",
            },
          ]}
          onApply={(index) => console.log(`Applied card ${index}`)}
        />
      </div>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
