# Frontend чат-сервиса

Чат-сервис, разработанный в учебных целях с использованием React. Реализует
чат между пользователями через WebSocket и сопутствующий CRUD. Задачей сервиса
является применение принципов e2e шифрования, описанных в
[данной статье](https://sii.pl/blog/en/practical-use-of-cryptography-on-the-example-of-instant-messaging-application/)

На данный момент в проекте реализована упрощенная схема регистрации и
авторизации с использованием JWT, изменение имени пользователя, поиск других
пользователей по имени и, непосредственно, возможности чата.

Вы можете отправлять сообщения другим пользователям через WebSocket. В случае,
если пользователь не в сети, сообщение будет сохранено в базе данных сервиса и
отправлено получателю при подключении.

> :warning: **Внимание**<br/>
> При авторизации ваш приватный ключ в рамках сервиса будет изменен. Пока что
> данный случай не обрабатывается, так что после повторной авторизации
> другие пользователи не смогут отправить вам сообщения. Данное поведение будет
> изменено в кратчайшем будущем.

> :warning: **Внимание**<br/>
> Данный сервис испльзует indexeddb для хранения данных, поэтому он может
> оказаться несовместим в вашим браузером. Работоспособность проверялась на
> Google Chrome и Min
