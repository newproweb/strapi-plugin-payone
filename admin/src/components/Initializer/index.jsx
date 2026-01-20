import * as React from "react";
import pluginId from "../../pluginId";

const Initializer = ({ setPlugin }) => {
  const ref = React.useRef(setPlugin);

  React.useEffect(() => {
    if (ref.current) {
      ref.current(pluginId);
    }
  }, []);

  return null;
};

export default Initializer;
