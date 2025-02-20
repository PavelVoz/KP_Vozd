<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require_once __DIR__ . '/config.php';

$app = AppFactory::create();

$container = $app->getContainer();
$container['config'] = function () use ($container) {
    return $container->get('settings')['db'];
};

$container['db'] = function ($c) {
    $dsn = "mysql:host={$c['config']['host']};dbname={$c['config']['database']};charset={$c['config']['charset']}";
    $opt = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    return new PDO($dsn, $c['config']['username'], $c['config']['password'], $opt);
};

$container['UserModel'] = function ($c) {
    return new User($c['db']);
};

$container['TicketModel'] = function ($c) {
    return new Ticket($c['db']);
};

// Пользовательские маршруты
$app->group('/users', function () use ($app) {
    $app->get('', function (Request $request, Response $response, $args) {
        $model = $this->get('UserModel');
        $users = $model->getAll();
        $response->getBody()->write(json_encode($users));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    });

    $app->get('/{id}', function (Request $request, Response $response, $args) {
        $model = $this->get('UserModel');
        $user = $model->find($args['id']);
        if (!$user) {
            throw new HttpNotFoundException($request, $response);
        }
        $response->getBody()->write(json_encode($user));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    });

    $app->post('', function (Request $request, Response $response, $args) {
        $data = $request->getParsedBody();
        $model = $this->get('UserModel');
        $user = $model->create($data);
        $response->getBody()->write(json_encode($user));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    });

    $app->put('/{id}', function (Request $request, Response $response, $args) {
        $data = $request->getParsedBody();
        $model = $this->get('UserModel');
        $user = $model->update($args['id'], $data);
        $response->getBody()->write(json_encode($user));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    });

    $app->delete('/{id}', function (Request $request, Response $response, $args) {
        $model = $this->get('UserModel');
        $result = $model->delete($args['id']);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    });
});

// Заявки маршруты
$app->group('/tickets', function () use ($app) {
    $app->get('', function (Request $request, Response $response, $args) {
        $model = $this->get('TicketModel');
        $tickets = $model->getAll();
        $response->getBody()->write(json_encode($tickets));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    });

    $app->get('/{id}', function (Request $request, Response $response, $args) {
        $model = $this->get('TicketModel');
        $ticket = $model->find($args['id']);
        if (!$ticket) {
            throw new HttpNotFoundException($request, $response);
        }
        $response->getBody()->write(json_encode($ticket));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    });

    $app->post('', function (Request $request, Response $response, $args) {
        $data = $request->getParsedBody();
        $model = $this->get('TicketModel');
        $ticket = $model->create($data);
        $response->getBody()->write(json_encode($ticket));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    });

    $app->put('/{id}', function (Request $request, Response $response, $args) {
        $data = $request->getParsedBody();
        $model = $this->get('TicketModel');
        $ticket = $model->update($args['id'], $data);
        $response->getBody()->write(json_encode($ticket));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    });

    $app->delete('/{id}', function (Request $request, Response $response, $args) {
        $model = $this->get('TicketModel');
        $result = $model->delete($args['id']);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    });
});

$app->run();