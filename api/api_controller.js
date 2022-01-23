const axios = require("axios");
const rand = require("random-seed").create();
require("dotenv").config();

const getArray = (num, max) => {
    let array = [];
    for (let i = 0; i < num; i++) {
        let random = rand.intBetween(0, max - 1);
        array.push(random);
    }
    return array;
}

const random_sort = (randomArray) => {
    let counts = [];
    randomArray.forEach((i) => { counts[i] = (counts[i] || 0) + 1 });
    counts = counts.filter((c) => { if (c) return c });
    counts = counts.sort();
    return counts;
}

const getScore = (counts) => {
    for (let score of scores) {
        if (arrayEquals(counts, score.counts)) {
            return score.rate;
        }
    }
    return 0;
}

const arrayEquals = (a, b) => {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

const Compare = (user_rate, robot_rate) => {
    let reward = 0;
    if (user_rate > robot_rate) {
        if (user_rate == 6) {
            reward = 6;
        } else if (user_rate == 4) {
            reward = 4;
        } else if (user_rate == 3) {
            reward = 3;
        } else if (user_rate == 5) {
            reward = 5;
        } else {
            reward = 2;
        }
    } else if (user_rate == robot_rate) {
        reward = 1;
    } else {
        reward = 0;
    }
    return reward;
}

const getAmount = (reward, betAmount) => {
    let earnAmount = 0;
    if (reward == 0) {
        earnAmount = 0;
    } else if (reward == 1) {
        earnAmount = betAmount;
    } else {
        earnAmount = betAmount * reward;
    }
    return earnAmount;
}

let scores = [
    {
        counts: [1, 1, 1, 1, 1],
        rate: 0
    },
    {
        counts: [1, 1, 1, 2],
        rate: 1
    },
    {
        counts: [1, 2, 2],
        rate: 2
    },
    {
        counts: [1, 1, 3],
        rate: 3
    },
    {
        counts: [2, 3],
        rate: 4
    },
    {
        counts: [1, 4],
        rate: 5
    },
    {
        counts: [5],
        rate: 6
    },
]

module.exports = {
    PlayGame: async (req, res) => {
        try {
            let users = [];
            let earnAmount = 0;

            const { token, betAmount } = req.body;

            const bet_Amount = parseFloat(betAmount);

            users[token] = {
                token: token,
                betAmount: bet_Amount
            }
            try {
                await axios.post(process.env.PLATFORM_SERVER + "api/games/bet", {
                    token: users[token].token,
                    amount: users[token].betAmount
                });
            } catch (err) {
                throw new Error("BET ERROR!");
            }

            try {
                let color_user = await getArray(5, 7);
                let color_robot = await getArray(5, 7);

                let _color_user = [...color_user];
                let _color_robot = [...color_robot];

                color_user = await random_sort(color_user);
                color_robot = await random_sort(color_robot);

                let user_rate = await getScore(color_user);
                let robot_rate = await getScore(color_robot);

                let reward = await Compare(user_rate, robot_rate);

                earnAmount = await getAmount(reward, users[token].betAmount);
                res.json({
                    reward: reward,
                    earnAmount: earnAmount - users[token].betAmount,
                    User_color: _color_user,
                    Robot_color: _color_robot,
                    Message: "SUCCESS!"
                })

            } catch (err) {
                throw new Error("DATA ERROR!");
            }
            try {
                await axios.post(process.env.PLATFORM_SERVER + "api/games/winlose", {
                    token: users[token].token,
                    amount: earnAmount,
                    winState: earnAmount > 0 ? true : false
                });
            } catch (err) {
                throw new Error("SERVER ERROR!");
            }
        } catch (err) {
            res.json({

                Message: err.message
            });
        }
    },
};
